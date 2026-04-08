import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

export function passwordStrength(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[@$!%*?&]/.test(value);
    const minLength = value.length >= 8;

    const errors: ValidationErrors = {};
    if (!hasUpper) errors["noUppercase"] = true;
    if (!hasLower) errors["noLowercase"] = true;
    if (!hasNumber) errors["noNumber"] = true;
    if (!hasSpecial) errors["noSpecial"] = true;
    if (!minLength) errors["minLength"] = true;

    return Object.keys(errors).length ? errors : null;
  };
}
