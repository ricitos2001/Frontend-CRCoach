import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-form-input',
  imports: [CommonModule, TranslateModule],
  templateUrl: './form-input.component.html',
  styleUrl: '../../../../styles/styles.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormInputComponent),
      multi: true,
    },
  ],
  standalone: true,
})
export class FormInputComponent implements ControlValueAccessor {
  @Input() type: string = 'text';
  @Input() name!: string;
  @Input() placeholder: string = '';
  @Input() label?: string;
  @Input() hideLabel: boolean = false;
  @Input() required: boolean = false;
  @Input() value: any = '';
  /**
   * Options for select inputs. Each option should be { value: any, label: string }
   */
  @Input() options: Array<{ value: any; label: string }> = [];

  disabled = false;
  touched = false;

  private onChange = (_: any) => {};
  private onTouched = () => {};

  writeValue(value: any): void {
    if (this.type === 'checkbox') {
      this.value = !!value;
    } else {
      this.value = value ?? '';
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    const value = target.value;
    this.value = value;
    this.onChange(value);
  }

  onCheckboxChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.value = checked;
    this.onChange(checked);
  }

  onBlur(): void {
    this.touched = true;
    this.onTouched();
  }
}
