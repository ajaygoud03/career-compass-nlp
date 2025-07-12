import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FileUpload } from '@/components/FileUpload';
import { AnalysisResults } from '@/components/AnalysisResults';
import { analyzeResumeMatch, extractTextFromFile, AnalysisResult } from '@/utils/aiProcessor';
import { toast } from 'sonner';
import { Brain, FileText, Target, Zap } from 'lucide-react';

const Index = () => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescFile, setJobDescFile] = useState<File | null>(null);
  const [resumeProgress, setResumeProgress] = useState(0);
  const [jobDescProgress, setJobDescProgress] = useState(0);
  const [isProcessingResume, setIsProcessingResume] = useState(false);
  const [isProcessingJobDesc, setIsProcessingJobDesc] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleResumeUpload = async (file: File) => {
    setResumeFile(file);
    setIsProcessingResume(true);
    setResumeProgress(0);

    try {
      // Simulate processing progress
      const progressInterval = setInterval(() => {
        setResumeProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      await extractTextFromFile(file);
      clearInterval(progressInterval);
      setResumeProgress(100);
      toast.success('Resume uploaded and processed successfully!');
    } catch (error) {
      toast.error('Failed to process resume file');
      setResumeFile(null);
    } finally {
      setIsProcessingResume(false);
    }
  };

  const handleJobDescUpload = async (file: File) => {
    setJobDescFile(file);
    setIsProcessingJobDesc(true);
    setJobDescProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setJobDescProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      await extractTextFromFile(file);
      clearInterval(progressInterval);
      setJobDescProgress(100);
      toast.success('Job description uploaded and processed successfully!');
    } catch (error) {
      toast.error('Failed to process job description file');
      setJobDescFile(null);
    } finally {
      setIsProcessingJobDesc(false);
    }
  };

  const handleAnalysis = async () => {
    if (!resumeFile || !jobDescFile) {
      toast.error('Please upload both resume and job description');
      return;
    }

    setIsAnalyzing(true);
    try {
      const resumeText = await extractTextFromFile(resumeFile);
      const jobDescText = await extractTextFromFile(jobDescFile);

      const results = await analyzeResumeMatch(
        resumeText,
        jobDescText,
        (progress) => console.log(`Analysis progress: ${progress}%`)
      );

      setAnalysisResults(results);
      toast.success('Analysis completed successfully!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze resume match');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setResumeFile(null);
    setJobDescFile(null);
    setAnalysisResults(null);
    setResumeProgress(0);
    setJobDescProgress(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold gradient-text">AI Resume Matcher</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Analyze how well your resume matches job descriptions using advanced AI and NLP technology
          </p>
        </div>

        {/* Features Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Smart Text Extraction</h3>
              <p className="text-sm text-muted-foreground">
                Extract and analyze content from PDF, DOCX, and text files
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Target className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Semantic Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Advanced AI models analyze skills, experience, and keyword matching
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Actionable Insights</h3>
              <p className="text-sm text-muted-foreground">
                Get specific recommendations to improve your resume match score
              </p>
            </CardContent>
          </Card>
        </div>

        {!analysisResults ? (
          <div className="max-w-4xl mx-auto">
            {/* File Upload Section */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Upload Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <FileUpload
                    title="Upload Resume"
                    description="Upload your resume in PDF, DOCX, or TXT format"
                    acceptedTypes={['PDF', 'DOCX', 'TXT']}
                    onFileUpload={handleResumeUpload}
                    uploadProgress={resumeProgress}
                    isProcessing={isProcessingResume}
                    uploadedFile={resumeFile}
                    onRemoveFile={() => setResumeFile(null)}
                  />
                  <FileUpload
                    title="Upload Job Description"
                    description="Upload the job description you want to match against"
                    acceptedTypes={['PDF', 'DOCX', 'TXT']}
                    onFileUpload={handleJobDescUpload}
                    uploadProgress={jobDescProgress}
                    isProcessing={isProcessingJobDesc}
                    uploadedFile={jobDescFile}
                    onRemoveFile={() => setJobDescFile(null)}
                  />
                </div>

                <Separator className="my-6" />

                <div className="text-center">
                  <Button
                    onClick={handleAnalysis}
                    disabled={!resumeFile || !jobDescFile || isAnalyzing}
                    size="lg"
                    className="w-full md:w-auto"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Analyzing Match...
                      </>
                    ) : (
                      <>
                        <Brain className="h-5 w-5 mr-2" />
                        Analyze Resume Match
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Analysis Results</h2>
              <Button onClick={resetAnalysis} variant="outline">
                Start New Analysis
              </Button>
            </div>
            
            <AnalysisResults
              overallScore={analysisResults.overallScore}
              sectionScores={analysisResults.sectionScores}
              missingSkills={analysisResults.missingSkills}
              matchedSkills={analysisResults.matchedSkills}
              recommendations={analysisResults.recommendations}
              isLoading={isAnalyzing}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
