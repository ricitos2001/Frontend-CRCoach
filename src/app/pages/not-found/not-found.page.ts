import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  templateUrl: './not-found.page.html',
  styleUrl: '../../../styles/styles.css',
  standalone: true,
})
export class NotFoundPage {}
