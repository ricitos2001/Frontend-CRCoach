import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function phoneNumberValidation(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    // Normalizar: eliminar espacios, guiones y paréntesis
    let val: string = String(control.value).trim();
    // permitir formatos con +34 o 0034; quitar caracteres no numéricos excepto +
    val = val.replace(/[\s()\-]/g, '');

    // Convertir 00-prefijos a + para simplificar
    if (val.startsWith('00')) {
      val = '+' + val.slice(2);
    }

    // Extraer la parte nacional si tiene prefijo internacional español
    const national = val.replace(/^\+34|^0034/, '').replace(/^0+/, '');

    // Debe quedar exactamente 9 dígitos nacionales
    const digitsOnly = national.replace(/\D/g, '');
    if (digitsOnly.length !== 9) return { invalidPhoneNumber: true };

    // Validar primer dígito: en España números comienzan por 6-9 (móviles 6/7, fijos 8/9)
    const valid = /^[6-9]\d{8}$/.test(digitsOnly);

    return valid ? null : { invalidPhoneNumber: true };
  };
}
