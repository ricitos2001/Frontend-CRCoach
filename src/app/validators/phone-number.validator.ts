import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function phoneNumberValidation(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    let val: string = String(control.value).trim();
    val = val.replace(/[\s()\-]/g, '');
    if (val.startsWith('00')) {
      val = '+' + val.slice(2);
    }
    const e164Regex = /^\+[1-9]\d{1,14}$/;

    if (e164Regex.test(val)) {
      return null;
    }
    const digitsOnly = val.replace(/\D/g, '');
    if (digitsOnly.length >= 6 && digitsOnly.length <= 15) {
      return null;
    }
    return { invalidPhoneNumber: true };
  };
}
