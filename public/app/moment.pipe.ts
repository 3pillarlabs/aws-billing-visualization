import { Pipe, PipeTransform } from '@angular/core';
declare var moment: any;
@Pipe({name: 'moment'})
export class MomentPipe implements PipeTransform {
  transform(value: string, format: string): string {
    return moment(value, "YYYY-MM-DD").format(format);
  }
}