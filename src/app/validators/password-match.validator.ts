import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

export function passwordMatch(controlName: string, matchControlName: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const control = group.get(controlName);
    const matchControl = group.get(matchControlName);
    if (!control || !matchControl) return null;
    // Si el campo coincidente tiene otros errores (distintos a mismatch), no sobreescribirlos
    if (matchControl.errors && !matchControl.errors['mismatch']) return null;

    return control.value === matchControl.value ? null : { mismatch: true };
  };
}
