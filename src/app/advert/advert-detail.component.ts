import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Advert } from '../models/advert';
import { AdvertService } from '../services/advert.service';

@Component({
  selector: 'app-advert-detail',
  templateUrl: './advert-detail.component.html',
  styleUrls: ['./advert-detail.component.css']
})
export class AdvertDetailComponent implements OnInit {
  
  @Input() advert: Advert | undefined;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private adService: AdvertService) {}

  ngOnInit(): void {}

}
