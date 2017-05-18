import { Component } from '@angular/core';

@Component({
    selector:'aws-billing-footer',
    template:`<footer class="footer col-xs-12">
            <div class="container-fluid">
            <p class="text-muted">© {{todayDate | date: 'yyyy'}} - 3Pillar Global, Inc.</p>
            </div>
        </footer>`
})

export class FooterComponent{
    todayDate:any=new Date();
    
}