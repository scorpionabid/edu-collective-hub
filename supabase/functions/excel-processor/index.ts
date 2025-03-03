
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ImportJobStatus {
  id: string;
  status: "waiting" | "processing" | "complete" | "error";
  progress: number;
  total_rows: number;
  processed_rows: number;
  errors: Array<{ row: number; message: string }>;
  file_name: string;
  table_name: string;
  with_upsert: boolean;
  key_field?: string;
  created_by: string;
}

interface ExportJobStatus {
  id: string;
  status: "waiting" | "processing" | "complete" | "error";
  progress: number;
  total_rows: number;
  processed_rows: number;
  errors: Array<{ message: string }>;
  file_name: string;
  download_url?: string;
  created_by: string;
}

async function processImport(jobId: string): Promise<Response> {
  try {
    // Get job details
    const { data: job, error: jobError } = await supabase
      .from("import_jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      return new Response(
        JSON.stringify({ error: "Job not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Update job status to processing
    await supabase
      .from("import_jobs")
      .update({
        status: "processing",
        progress: 0,
      })
      .eq("id", jobId);

    // Get file from storage
    const { data: fileData, error: fileError } = await supabase.storage
      .from("temp-imports")
      .download(`${jobId}/${job.file_name}`);

    if (fileError || !fileData) {
      await supabase
        .from("import_jobs")
        .update({
          status: "error",
          errors: [{ message: `File not found: ${fileError?.message || "Unknown error"}` }],
        })
        .eq("id", jobId);

      return new Response(
        JSON.stringify({ error: "File not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Parse Excel file
    const workbook = await XLSX.read(await fileData.arrayBuffer(), { type: "array" });
    const worksheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[worksheetName];

    // Get total rows by checking range
    const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
    const totalRows = range.e.r; // Last row (0-indexed)

    // Update total row count in job status
    await supabase
      .from("import_jobs")
      .update({
        total_rows: totalRows,
      })
      .eq("id", jobId);

    // Convert to JSON with headers
    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: null });

    // Process in batches
    const batchSize = 1000;
    const totalBatches = Math.ceil(rows.length / batchSize);
    const errors: Array<{ row: number; message: string }> = [];

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const start = batchIndex * batchSize;
      const end = Math.min(start + batchSize, rows.length);
      const batch = rows.slice(start, end);

      // Process each row in the batch
      const rowsToInsert = [];

      for (let i = 0; i < batch.length; i++) {
        const rowIndex = start + i + 2; // +2 for 1-based index and header row
        const row = batch[i];

        try {
          // Basic validation - ensure required fields are present
          if (!row) {
            errors.push({
              row: rowIndex,
              message: "Empty row",
            });
            continue;
          }

          // Add to batch
          rowsToInsert.push(row);
        } catch (error) {
          errors.push({
            row: rowIndex,
            message: error.message || "Error processing row",
          });
        }
      }

      // Insert batch into database
      if (rowsToInsert.length > 0) {
        let error;

        if (job.with_upsert && job.key_field) {
          // Use upsert with the specified key field
          const { error: upsertError } = await supabase
            .from(job.table_name)
            .upsert(rowsToInsert, {
              onConflict: job.key_field,
            });
          error = upsertError;
        } else {
          // Use regular insert
          const { error: insertError } = await supabase
            .from(job.table_name)
            .insert(rowsToInsert);
          error = insertError;
        }

        if (error) {
          console.error(`Batch ${batchIndex + 1} insert error:`, error);
          errors.push({
            row: start + 2,
            message: `Batch insert error: ${error.message}`,
          });
        }
      }

      // Update progress
      const progress = Math.round(((batchIndex + 1) / totalBatches) * 100);
      const processedRows = (batchIndex + 1) * batchSize;

      await supabase
        .from("import_jobs")
        .update({
          progress,
          processed_rows: Math.min(processedRows, rows.length),
          errors: errors.length > 0 ? errors : null,
        })
        .eq("id", jobId);
    }

    // Update job status to complete
    await supabase
      .from("import_jobs")
      .update({
        status: "complete",
        progress: 100,
        processed_rows: rows.length - errors.length,
        errors: errors.length > 0 ? errors : null,
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    // Clean up temp storage
    await supabase.storage
      .from("temp-imports")
      .remove([`${jobId}/${job.file_name}`]);

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: rows.length - errors.length,
        errors: errors.length 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing import:", error);

    // Update job status to error
    await supabase
      .from("import_jobs")
      .update({
        status: "error",
        errors: [{ message: error.message || "Unknown error" }],
      })
      .eq("id", jobId);

    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}

async function processExport(
  jobId: string, 
  headers: string[], 
  fileName: string,
  dataBatch: any[],
  totalRows: number,
  hasMoreBatches: boolean
): Promise<Response> {
  try {
    // Get job details or create a new one
    let job: ExportJobStatus;
    const { data: existingJob, error: jobError } = await supabase
      .from("export_jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (jobError || !existingJob) {
      // Create new job
      const { data: newJob, error: createError } = await supabase
        .from("export_jobs")
        .insert({
          id: jobId,
          status: "processing",
          progress: 0,
          total_rows: totalRows,
          processed_rows: 0,
          file_name: fileName,
          created_by: "system", // This should ideally come from auth
        })
        .select("*")
        .single();

      if (createError || !newJob) {
        throw new Error(`Failed to create export job: ${createError?.message}`);
      }

      job = newJob as unknown as ExportJobStatus;
    } else {
      job = existingJob as unknown as ExportJobStatus;
    }

    // Create new workbook or get existing
    let workbook: XLSX.WorkBook;

    // Check if we have an existing workbook in storage
    const { data: existingFile } = await supabase.storage
      .from("temp-exports")
      .download(`${jobId}/temp_${fileName}`);

    if (existingFile) {
      // Load existing workbook
      workbook = XLSX.read(await existingFile.arrayBuffer(), { type: "array" });
    } else {
      // Create new workbook
      workbook = XLSX.utils.book_new();
      
      // Create worksheet with headers
      const ws = XLSX.utils.aoa_to_sheet([headers]);
      XLSX.utils.book_append_sheet(workbook, ws, "Data");
    }

    // Get the active worksheet
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    // Process first batch
    const rows = dataBatch.map(row => {
      return headers.map(header => row[header] || "");
    });

    // Append rows to worksheet (starting after any existing data)
    const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
    const startRow = range.e.r + 1; // Start after last row
    
    XLSX.utils.sheet_add_aoa(worksheet, rows, { origin: { r: startRow, c: 0 } });

    // Write back to storage
    const buffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
    
    await supabase.storage
      .from("temp-exports")
      .upload(`${jobId}/temp_${fileName}`, buffer, {
        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        upsert: true,
      });

    // Update progress
    const processedRows = job.processed_rows + dataBatch.length;
    const progress = Math.round((processedRows / totalRows) * 100);

    await supabase
      .from("export_jobs")
      .update({
        progress,
        processed_rows: processedRows,
      })
      .eq("id", jobId);

    // If all batches are processed, finalize the export
    if (!hasMoreBatches) {
      // Create final file
      const { data: signedUrl } = await supabase.storage
        .from("exports")
        .upload(`${job.created_by}/${fileName}`, buffer, {
          contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          upsert: true,
        });

      // Generate download URL
      const { data: publicUrl } = await supabase.storage
        .from("exports")
        .getPublicUrl(`${job.created_by}/${fileName}`);

      // Update job status to complete
      await supabase
        .from("export_jobs")
        .update({
          status: "complete",
          progress: 100,
          download_url: publicUrl?.publicUrl,
          completed_at: new Date().toISOString(),
        })
        .eq("id", jobId);

      // Clean up temp files
      await supabase.storage
        .from("temp-exports")
        .remove([`${jobId}/temp_${fileName}`]);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: processedRows,
        total: totalRows,
        progress,
        is_complete: !hasMoreBatches 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing export:", error);

    // Update job status to error
    await supabase
      .from("export_jobs")
      .update({
        status: "error",
        errors: [{ message: error.message || "Unknown error" }],
      })
      .eq("id", jobId);

    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}

async function processExportBatch(
  jobId: string,
  dataBatch: any[],
  batchIndex: number,
  hasMoreBatches: boolean
): Promise<Response> {
  try {
    // Get job details
    const { data: job, error: jobError } = await supabase
      .from("export_jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      return new Response(
        JSON.stringify({ error: "Job not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Get existing workbook from storage
    const { data: existingFile, error: fileError } = await supabase.storage
      .from("temp-exports")
      .download(`${jobId}/temp_${job.file_name}`);

    if (fileError || !existingFile) {
      throw new Error(`Failed to get workbook: ${fileError?.message}`);
    }

    // Load existing workbook
    const workbook = XLSX.read(await existingFile.arrayBuffer(), { type: "array" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    // Get headers from first row
    const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
    const headers = [];
    
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c });
      headers.push(worksheet[cellAddress]?.v || "");
    }

    // Process batch
    const rows = dataBatch.map(row => {
      return headers.map(header => row[header] || "");
    });

    // Calculate starting row for this batch
    // If batchIndex is 1 (second batch), and each batch is 1000 rows,
    // startRow should be 1 (header) + 1000 (first batch) = 1001
    const batchSize = 1000; // Assuming constant batch size
    const startRow = 1 + (batchIndex * batchSize);
    
    // Append rows to worksheet
    XLSX.utils.sheet_add_aoa(worksheet, rows, { origin: { r: startRow, c: 0 } });

    // Write back to storage
    const buffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
    
    await supabase.storage
      .from("temp-exports")
      .upload(`${jobId}/temp_${job.file_name}`, buffer, {
        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        upsert: true,
      });

    // Update progress
    const processedRows = job.processed_rows + dataBatch.length;
    const progress = Math.round((processedRows / job.total_rows) * 100);

    await supabase
      .from("export_jobs")
      .update({
        progress,
        processed_rows: processedRows,
      })
      .eq("id", jobId);

    // If all batches are processed, finalize the export
    if (!hasMoreBatches) {
      // Create final file
      const { data: signedUrl } = await supabase.storage
        .from("exports")
        .upload(`${job.created_by}/${job.file_name}`, buffer, {
          contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          upsert: true,
        });

      // Generate download URL
      const { data: publicUrl } = supabase.storage
        .from("exports")
        .getPublicUrl(`${job.created_by}/${job.file_name}`);

      // Update job status to complete
      await supabase
        .from("export_jobs")
        .update({
          status: "complete",
          progress: 100,
          download_url: publicUrl?.publicUrl,
          completed_at: new Date().toISOString(),
        })
        .eq("id", jobId);

      // Clean up temp files
      await supabase.storage
        .from("temp-exports")
        .remove([`${jobId}/temp_${job.file_name}`]);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: processedRows,
        total: job.total_rows,
        progress,
        is_complete: !hasMoreBatches 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing export batch:", error);

    // Update job status to error
    await supabase
      .from("export_jobs")
      .update({
        status: "error",
        errors: [{ message: error.message || "Unknown error" }],
      })
      .eq("id", jobId);

    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}

async function cancelJob(jobId: string): Promise<Response> {
  try {
    // Update job status to canceled
    await supabase
      .from("import_jobs")
      .update({
        status: "error",
        errors: [{ message: "Job canceled by user" }],
      })
      .eq("id", jobId);

    // Clean up temp storage
    await supabase.storage
      .from("temp-imports")
      .remove([`${jobId}/*`]);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error canceling job:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, jobId } = body;

    console.log(`Handling ${action} request for job ${jobId}`);

    switch (action) {
      case "process":
        return processImport(jobId);
      
      case "resume":
        return processImport(jobId);
      
      case "cancel":
        return cancelJob(jobId);
      
      case "export":
        return processExport(
          jobId, 
          body.headers, 
          body.fileName,
          body.dataBatch,
          body.totalRows,
          body.hasMoreBatches
        );
      
      case "exportBatch":
        return processExportBatch(
          jobId,
          body.dataBatch,
          body.batchIndex,
          body.hasMoreBatches
        );
      
      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
