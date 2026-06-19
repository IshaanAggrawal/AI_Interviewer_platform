"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useApiClient } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Upload, Trash2, Calendar, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ResumesPage() {
  const { getToken } = useAuth();
  const api = useApiClient(getToken);
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchResumes = async () => {
    try {
      const res = await api.get("/resumes");
      setResumes(res.data.data);
    } catch (error) {
      console.error("Failed to fetch resumes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, [api]);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await api.post("/resumes/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchResumes();
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload resume.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;
    try {
      await api.delete(`/resumes/${id}`);
      await fetchResumes();
    } catch (error) {
      console.error("Delete failed", error);
      alert("Failed to delete resume.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Your Resumes</h1>
        <p className="mt-2 text-base text-muted-foreground">Manage your uploaded resumes for tailored mock interviews.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Upload Section */}
        <Card className="col-span-1 rounded-3xl border border-white/10 bg-[#111111] shadow-xl overflow-hidden h-fit">
          <CardHeader className="pb-4 border-b border-white/5 px-6 pt-6">
            <CardTitle className="text-lg font-bold text-white">Upload New</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div
              className={cn(
                "relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all text-center",
                dragActive
                  ? "border-primary bg-primary/10"
                  : "border-white/10 bg-white/5 hover:border-primary/40 hover:bg-white/10",
                uploading && "opacity-50 pointer-events-none"
              )}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                }}
              />
              {uploading ? (
                <>
                  <Loader2 className="mb-3 h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm font-semibold text-white">Uploading...</p>
                </>
              ) : (
                <>
                  <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium text-white mb-1">Click or drag file</p>
                  <p className="text-xs text-muted-foreground">PDF, DOC, DOCX up to 10MB</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Resumes List */}
        <div className="col-span-1 lg:col-span-2 space-y-4">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : resumes.length === 0 ? (
             <Card className="rounded-3xl border border-white/10 bg-[#111111] shadow-xl p-12 text-center flex flex-col items-center justify-center h-full min-h-[300px]">
               <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                 <FileText className="h-8 w-8 text-muted-foreground" />
               </div>
               <h2 className="text-xl font-bold text-white mb-2">No resumes found</h2>
               <p className="text-muted-foreground">Upload your first resume to get tailored mock interviews.</p>
             </Card>
          ) : (
            resumes.map((resume) => (
              <Card key={resume.id} className="rounded-2xl border border-white/5 bg-[#111111] transition-all hover:border-primary/30 hover:bg-white/5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)] group">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-white leading-tight">{resume.fileName}</p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(resume.createdAt).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Parsed
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
                    onClick={() => handleDelete(resume.id)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
