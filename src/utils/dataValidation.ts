
import { Patient } from "@/hooks/usePatients";
import { Appointment } from "@/hooks/useAppointments";
import { Financial } from "@/hooks/useFinancials";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const validatePatientData = (patient: Partial<Patient>): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validações obrigatórias
  if (!patient.name || patient.name.trim().length < 2) {
    errors.push("Nome do paciente deve ter pelo menos 2 caracteres");
  }

  // Validações de formato
  if (patient.email && !isValidEmail(patient.email)) {
    errors.push("Email deve ter um formato válido");
  }

  if (patient.phone && !isValidPhone(patient.phone)) {
    warnings.push("Telefone pode não estar em um formato válido");
  }

  if (patient.cpf && !isValidCPF(patient.cpf)) {
    errors.push("CPF deve ter um formato válido");
  }

  // Validação de data de nascimento
  if (patient.birth_date) {
    const birthDate = new Date(patient.birth_date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (age < 0 || age > 120) {
      errors.push("Data de nascimento deve ser válida");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const validateAppointmentData = (appointment: Partial<Appointment>): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validações obrigatórias
  if (!appointment.patient_id) {
    errors.push("Paciente deve ser selecionado");
  }

  if (!appointment.date) {
    errors.push("Data da consulta é obrigatória");
  }

  if (!appointment.time) {
    errors.push("Horário da consulta é obrigatório");
  }

  // Validações de formato e lógica
  if (appointment.date) {
    const appointmentDate = new Date(appointment.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (appointmentDate < today) {
      warnings.push("Consulta agendada para data passada");
    }
  }

  if (appointment.duration && (appointment.duration < 15 || appointment.duration > 180)) {
    warnings.push("Duração da consulta pode estar fora do padrão (15-180 minutos)");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const validateFinancialData = (financial: Partial<Financial>): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validações obrigatórias
  if (!financial.patient_id) {
    errors.push("Paciente deve ser selecionado");
  }

  if (!financial.amount || financial.amount <= 0) {
    errors.push("Valor deve ser maior que zero");
  }

  if (!financial.description || financial.description.trim().length < 3) {
    errors.push("Descrição deve ter pelo menos 3 caracteres");
  }

  if (!financial.date) {
    errors.push("Data é obrigatória");
  }

  // Validações de lógica
  if (financial.amount && financial.amount > 10000) {
    warnings.push("Valor muito alto - verifique se está correto");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Funções auxiliares de validação
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
};

const isValidCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, '');
  
  if (cleanCPF.length !== 11) return false;
  
  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Validar dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
  
  return true;
};
