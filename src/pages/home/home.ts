import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';

import { ImageCacheDirective } from '../../components/imagecache/imagecache';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController) {

  }

}
