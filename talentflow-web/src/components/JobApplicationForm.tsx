"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Phone, MapPin, Link2, FileText, Upload,
  CheckCircle2, Loader2, AlertTriangle, ArrowRight, ArrowLeft,
  Shield, Sparkles, X
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface JobApplicationFormProps {
  jobSlug: string;
  jobTitle: string;
  onClose: () => void;
}

type Step = "form" | "otp" | "processing" | "success" | "error";

interface FormData {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  linkedin: string;
  cover_letter: string;
  resume: File | null;
}

interface FieldError {
  [key: string]: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function validateForm(data: FormData): FieldError {
  const errors: FieldError = {};
  if (!data.full_name.trim()) errors.full_name = "Nome é obrigatório.";
  if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.email = "E-mail inválido.";
  if (!data.phone.trim()) errors.phone = "Telefone é obrigatório.";
  if (!data.resume) errors.resume = "O currículo em PDF é obrigatório.";
  return errors;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ProgressBar({ step }: { step: Step }) {
  const stepIndex = { form: 1, otp: 2, processing: 3, success: 3, error: 3 }[step] || 1;
  return (
    <div className="flex items-center gap-2 mb-8">
      {[
        { label: "Dados", idx: 1 },
        { label: "Verificação", idx: 2 },
        { label: "Confirmação", idx: 3 },
      ].map(({ label, idx }) => (
        <div key={idx} className="flex items-center gap-2 flex-1">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all duration-300 ${
              stepIndex >= idx
                ? "bg-primary text-white shadow-lg shadow-primary/30"
                : "bg-slate-200 dark:bg-slate-800 text-slate-400"
            }`}
          >
            {stepIndex > idx ? <CheckCircle2 className="w-4 h-4" /> : idx}
          </div>
          <span className={`text-xs font-medium hidden sm:block ${stepIndex >= idx ? "text-primary" : "text-slate-400"}`}>
            {label}
          </span>
          {idx < 3 && (
            <div className={`flex-1 h-0.5 rounded-full transition-all duration-500 ${stepIndex > idx ? "bg-primary" : "bg-slate-200 dark:bg-slate-800"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function InputField({
  label, icon: Icon, error, required, ...props
}: {
  label: string;
  icon: React.ElementType;
  error?: string;
  required?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
        {label} {required && <span className="text-primary">*</span>}
      </label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          {...props}
          className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
            error
              ? "border-rose-400 focus:ring-rose-400/20"
              : "border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary/20"
          }`}
        />
      </div>
      {error && (
        <p className="text-xs text-rose-500 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function JobApplicationForm({ jobSlug, jobTitle, onClose }: JobApplicationFormProps) {
  const [step, setStep] = useState<Step>("form");
  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    linkedin: "",
    cover_letter: "",
    resume: null,
  });
  const [errors, setErrors] = useState<FieldError>({});
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>("pending");
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Step 1: Submit form
  // ---------------------------------------------------------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("full_name", formData.full_name);
      fd.append("email", formData.email);
      fd.append("phone", formData.phone);
      if (formData.address) fd.append("address", formData.address);
      if (formData.linkedin) fd.append("linkedin", formData.linkedin);
      if (formData.cover_letter) fd.append("cover_letter", formData.cover_letter);
      fd.append("resume", formData.resume!);

      const res = await fetch(`${API_URL}/api/public/apply/${jobSlug}`, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Erro ao enviar candidatura.");
      }

      const data = await res.json();
      setApplicationId(data.application_id);
      setStep("otp");
    } catch (err: any) {
      setErrors({ general: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Step 2: OTP verification
  // ---------------------------------------------------------------------------

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const updated = [...otpDigits];
    updated[index] = value;
    setOtpDigits(updated);
    setOtpError(null);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtpDigits(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otpDigits.join("");
    if (code.length < 6) {
      setOtpError("Digite todos os 6 dígitos do código.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/public/apply/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ application_id: applicationId, otp_code: code }),
      });

      if (!res.ok) {
        const err = await res.json();
        setOtpError(err.detail || "Código inválido.");
        return;
      }

      setStep("processing");
      startPolling();
    } catch {
      setOtpError("Erro ao verificar o código. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Step 3: Poll processing status
  // ---------------------------------------------------------------------------

  const startPolling = () => {
    if (!applicationId) return;
    let attempts = 0;
    const maxAttempts = 30; // 30s timeout

    pollingRef.current = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`${API_URL}/api/public/apply/status/${applicationId}`);
        if (res.ok) {
          const data = await res.json();
          setProcessingStatus(data.status);

          if (data.status === "reviewing" || data.status === "accepted" || data.status === "error") {
            clearInterval(pollingRef.current!);
            setStep(data.status === "error" ? "error" : "success");
          }
        }
      } catch {
        /* silently retry */
      }

      if (attempts >= maxAttempts) {
        clearInterval(pollingRef.current!);
        // Timeout → assume success (pipeline still running in bg)
        setStep("success");
      }
    }, 1000);
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="px-8 pt-8 pb-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full mb-2">
                <Sparkles className="w-3 h-3" /> Candidatura
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                {jobTitle}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <ProgressBar step={step} />
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <AnimatePresence mode="wait">

            {/* ── STEP: FORM ── */}
            {step === "form" && (
              <motion.form
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <InputField
                  label="Nome completo"
                  icon={User}
                  required
                  placeholder="João da Silva"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  error={errors.full_name}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="E-mail"
                    icon={Mail}
                    required
                    type="email"
                    placeholder="joao@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    error={errors.email}
                  />
                  <InputField
                    label="Telefone"
                    icon={Phone}
                    required
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    error={errors.phone}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Localização"
                    icon={MapPin}
                    placeholder="São Paulo, SP"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                <InputField
                    label="LinkedIn"
                    icon={Link2}
                    placeholder="linkedin.com/in/joao"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  />
                </div>

                {/* Carta de apresentação */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <FileText className="w-4 h-4 text-slate-400" /> Carta de apresentação
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Conte brevemente por que você é o candidato ideal..."
                    value={formData.cover_letter}
                    onChange={(e) => setFormData({ ...formData, cover_letter: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                  />
                </div>

                {/* Upload de PDF */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Upload className="w-4 h-4 text-slate-400" /> Currículo (PDF) <span className="text-primary">*</span>
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all group ${
                      resumeFileName
                        ? "border-primary/50 bg-primary/5"
                        : errors.resume
                        ? "border-rose-400 bg-rose-50 dark:bg-rose-950/20"
                        : "border-slate-300 dark:border-slate-700 hover:border-primary hover:bg-primary/5"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setFormData({ ...formData, resume: file });
                        setResumeFileName(file?.name || null);
                        if (errors.resume) setErrors({ ...errors, resume: "" });
                      }}
                    />
                    {resumeFileName ? (
                      <>
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        </div>
                        <p className="text-sm font-semibold text-primary text-center">{resumeFileName}</p>
                        <p className="text-xs text-slate-400">Clique para trocar o arquivo</p>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                          <Upload className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                        </div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 text-center">
                          Arraste seu PDF aqui ou <span className="text-primary font-semibold">clique para selecionar</span>
                        </p>
                        <p className="text-xs text-slate-400">Somente arquivos .pdf</p>
                      </>
                    )}
                  </div>
                  {errors.resume && (
                    <p className="text-xs text-rose-500 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> {errors.resume}
                    </p>
                  )}
                </div>

                {errors.general && (
                  <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl p-4 text-sm text-rose-600 dark:text-rose-400">
                    {errors.general}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/25"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Enviando...</>
                  ) : (
                    <> Enviar Candidatura <ArrowRight className="w-5 h-5" /></>
                  )}
                </button>
              </motion.form>
            )}

            {/* ── STEP: OTP ── */}
            {step === "otp" && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col items-center text-center gap-6 py-4"
              >
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="w-10 h-10 text-primary" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-bounce">
                    <Mail className="w-3 h-3 text-white" />
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    Confirme seu e-mail
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                    Enviamos um código de 6 dígitos para <strong className="text-slate-700 dark:text-slate-300">{formData.email}</strong>. Insira-o abaixo.
                  </p>
                </div>

                {/* OTP Inputs */}
                <div className="flex gap-3" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none transition-all ${
                        otpError
                          ? "border-rose-400 focus:border-rose-400"
                          : digit
                          ? "border-primary shadow-lg shadow-primary/20"
                          : "border-slate-200 dark:border-slate-700 focus:border-primary"
                      }`}
                    />
                  ))}
                </div>

                {otpError && (
                  <p className="text-sm text-rose-500 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> {otpError}
                  </p>
                )}

                <p className="text-xs text-slate-400">
                  O código expira em 10 minutos. Verifique também o spam.
                </p>

                <div className="flex flex-col gap-3 w-full">
                  <button
                    onClick={handleVerifyOtp}
                    disabled={isSubmitting || otpDigits.join("").length < 6}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/25"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Verificando...</>
                    ) : (
                      <><CheckCircle2 className="w-5 h-5" /> Confirmar Código</>
                    )}
                  </button>
                  <button
                    onClick={() => setStep("form")}
                    className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Voltar e editar dados
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP: PROCESSING ── */}
            {step === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center text-center gap-6 py-10"
              >
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    Analisando seu currículo...
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                    Nossa IA está processando seu PDF, extraindo dados e calculando seu score de perfil.
                  </p>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
                    initial={{ width: "10%" }}
                    animate={{ width: "90%" }}
                    transition={{ duration: 25, ease: "easeOut" }}
                  />
                </div>
                <p className="text-xs text-slate-400 animate-pulse">
                  Status: {processingStatus === "pending" ? "Aguardando na fila..." : "Processando dados do PDF..."}
                </p>
              </motion.div>
            )}

            {/* ── STEP: SUCCESS ── */}
            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center text-center gap-6 py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 10, delay: 0.2 }}
                  className="relative"
                >
                  <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                  </div>
                  <div className="absolute inset-0 bg-emerald-400/20 blur-2xl rounded-full animate-pulse" />
                </motion.div>

                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Candidatura enviada! 🎉
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                    Tudo certo, <strong className="text-slate-700 dark:text-slate-300">{formData.full_name.split(" ")[0]}</strong>! Seu perfil está em análise e nossa equipe entrará em contato.
                  </p>
                </div>

                <div className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-left space-y-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Resumo</p>
                  <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    Currículo recebido e processado pela IA
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    E-mail verificado com sucesso
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    Candidatura registrada para <strong>{jobTitle}</strong>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3.5 rounded-xl font-bold hover:opacity-90 transition-all"
                >
                  Fechar
                </button>
              </motion.div>
            )}

            {/* ── STEP: ERROR ── */}
            {step === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center text-center gap-6 py-8"
              >
                <div className="w-20 h-20 rounded-full bg-rose-100 dark:bg-rose-950/30 flex items-center justify-center">
                  <AlertTriangle className="w-10 h-10 text-rose-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    Algo deu errado
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                    Ocorreu um erro no processamento do seu currículo. Tente novamente ou entre em contato com a empresa.
                  </p>
                </div>
                <button
                  onClick={() => { setStep("form"); setOtpDigits(["","","","","",""]); }}
                  className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-primary/90 transition-all"
                >
                  Tentar novamente
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
