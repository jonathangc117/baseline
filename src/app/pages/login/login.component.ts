import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { DividerModule } from 'primeng/divider';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    MessageModule,
    DividerModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  signupForm: FormGroup;
  loading = false;
  error: string | null = null;
  success: string | null = null;
  isLoginMode = true;

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.signupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    // Add custom validator for password confirmation
    this.signupForm.addValidators(this.passwordMatchValidator.bind(this));
  }

  passwordMatchValidator(control: AbstractControl) {
    const form = control as FormGroup;
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    if (confirmPassword?.errors?.['passwordMismatch']) {
      delete confirmPassword.errors['passwordMismatch'];
      if (Object.keys(confirmPassword.errors).length === 0) {
        confirmPassword.setErrors(null);
      }
    }
    
    return null;
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.error = null;
    this.success = null;
  }

  async onLogin() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.error = null;

      const { email, password } = this.loginForm.value;

      try {
        const { data, error } = await this.supabaseService.signIn(email, password);

        if (error) {
          this.error = error.message;
        } else if (data.user) {
          this.success = 'Login successful!';
          // Redirect to dashboard after successful login
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1000);
        }
      } catch (err) {
        this.error = 'An unexpected error occurred';
        console.error('Login error:', err);
      } finally {
        this.loading = false;
      }
    }
  }

  async onSignup() {
    if (this.signupForm.valid) {
      this.loading = true;
      this.error = null;

      const { name, email, password } = this.signupForm.value;

      try {
        const result = await this.supabaseService.signUp(email, password, name);

        if (result?.error) {
          this.error = result.error.message;
        } else if (result?.data?.user) {
          this.success = 'Account created successfully! Please check your email to verify your account.';
          // Switch to login mode after successful signup
          setTimeout(() => {
            this.isLoginMode = true;
            this.success = null;
          }, 3000);
        }
      } catch (err) {
        this.error = 'An unexpected error occurred';
        console.error('Signup error:', err);
      } finally {
        this.loading = false;
      }
    }
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email';
      if (field.errors['minlength']) {
        const minLength = field.errors['minlength'].requiredLength;
        return `${fieldName} must be at least ${minLength} characters`;
      }
      if (field.errors['passwordMismatch']) return 'Passwords do not match';
    }
    return '';
  }
}
