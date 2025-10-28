export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email.trim()) {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
};

export const validatePassword = (password: string): { isValid: boolean; error?: string } => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters long' };
  }

  // Optional: Add more password strength requirements
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }

  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }

  return { isValid: true };
};

export const validateName = (name: string): { isValid: boolean; error?: string } => {
  if (!name.trim()) {
    return { isValid: false, error: 'Name is required' };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' };
  }

  if (name.trim().length > 50) {
    return { isValid: false, error: 'Name must be less than 50 characters' };
  }

  const nameRegex = /^[a-zA-Z\s\-']+$/;
  if (!nameRegex.test(name)) {
    return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }

  return { isValid: true };
};

export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  const validTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ];
  
  const maxSize = 50 * 1024 * 1024; // 50MB

  if (!file) {
    return { isValid: false, error: 'Please select a file' };
  }

  if (!validTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: 'Please upload a PDF or Word document (.pdf, .doc, .docx)' 
    };
  }

  if (file.size > maxSize) {
    return { 
      isValid: false, 
      error: 'File size must be less than 50MB' 
    };
  }

  if (file.size === 0) {
    return { 
      isValid: false, 
      error: 'File appears to be empty' 
    };
  }

  return { isValid: true };
};

export const validateModuleName = (moduleName: string): { isValid: boolean; error?: string } => {
  if (!moduleName.trim()) {
    return { isValid: false, error: 'Module name is required' };
  }

  if (moduleName.trim().length < 3) {
    return { isValid: false, error: 'Module name must be at least 3 characters long' };
  }

  if (moduleName.trim().length > 100) {
    return { isValid: false, error: 'Module name must be less than 100 characters' };
  }

  // Allow letters, numbers, spaces, hyphens, and parentheses
  const moduleNameRegex = /^[a-zA-Z0-9\s\-_()&]+$/;
  if (!moduleNameRegex.test(moduleName)) {
    return { 
      isValid: false, 
      error: 'Module name can only contain letters, numbers, spaces, hyphens, underscores, and parentheses' 
    };
  }

  return { isValid: true };
};

export const validateQuestionCount = (count: number): { isValid: boolean; error?: string } => {
  const validCounts = [10, 20, 50];
  
  if (!validCounts.includes(count)) {
    return { 
      isValid: false, 
      error: 'Question count must be 10, 20, or 50' 
    };
  }

  return { isValid: true };
};

export const validateQuizAnswers = (answers: Record<string, number>, totalQuestions: number): { isValid: boolean; error?: string } => {
  const answeredCount = Object.keys(answers).length;

  if (answeredCount === 0) {
    return { isValid: false, error: 'Please answer at least one question before submitting' };
  }

  if (answeredCount < totalQuestions) {
    const unanswered = totalQuestions - answeredCount;
    return { 
      isValid: true, 
      error: `You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. You can still submit, but unanswered questions will be marked as incorrect.` 
    };
  }

  return { isValid: true };
};

// Form validation helper
export const validateForm = (fields: Record<string, any>, rules: Record<string, (value: any) => { isValid: boolean; error?: string }>) => {
  const errors: Record<string, string> = {};
  let isValid = true;

  Object.keys(rules).forEach(field => {
    const validation = rules[field](fields[field]);
    if (!validation.isValid) {
      errors[field] = validation.error!;
      isValid = false;
    }
  });

  return { isValid, errors };
};

// Async validation for unique checks (like email availability)
export const validateEmailUnique = async (email: string): Promise<{ isValid: boolean; error?: string }> => {
  // This would typically make an API call to check email availability
  // For now, we'll simulate a check
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const takenEmails = ['test@example.com', 'admin@example.com'];
  if (takenEmails.includes(email)) {
    return { isValid: false, error: 'This email is already registered' };
  }

  return { isValid: true };
};