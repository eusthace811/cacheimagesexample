import { Directive, ElementRef, Input, OnChanges, SimpleChange } from '@angular/core';
import { Platform } from 'ionic-angular';

import {PhotosService} from '../../providers/photos';

@Directive({
  selector: '[imageCache]'
})
export class ImageCacheDirective implements OnChanges {
  @Input() cache: string;

  constructor(private el: ElementRef, private platform: Platform, private photosService: PhotosService) {
    if ( !el.nativeElement.src ) {
      el.nativeElement.src = '';
    }
  }

  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    for (let propName in changes) {
      let changedProp = changes[propName];
      let to = JSON.stringify(changedProp.currentValue);
      this.checkCache(to);
    }
  }

  checkCache(imageSrc: string) {

    if (this.isEmpty(imageSrc)) {
      return;
    }

    this.platform.ready().then(() => {

      // Check URI
      if (this.isUriAbsolute(imageSrc)) {

        // Check if image is already saved
        this.photosService.findPhotoByURL(encodeURIComponent(imageSrc)).then((data) => {

          if (data.res.rows.length > 0) {
            
            // Image found, set image to element
            this.setImageToElement(this.el, data.res.rows.item(0).imageBase64String);

          } else {
            // Image not found, generate base64 image string, save and set
            this.setImageBase64String(this.el, imageSrc);
          }
        }, (error) => {
          console.log("-------------------------");
          console.log(error);
          console.log("-------------------------");
          // Error, generate base64 image string, save and set
          this.setImageBase64String(this.el, imageSrc);
        });
      }
    });
  }

  setImageBase64String(el: ElementRef, imageSrc: string) {

    this.getImageBase64String(imageSrc).then( (imageBase64String: any) => {

      this.photosService.savePhoto(encodeURIComponent(imageSrc), imageBase64String);
      this.setImageToElement(el, imageBase64String);
    }, (err) => {
      console.log(err);
    });
  }

  getImageBase64String(url: string) {
    return new Promise( (resolve: any, reject: any) => {
     
      // Convert image to base64 string
      var canvas: any = document.createElement('CANVAS'),
        ctx: any = canvas.getContext('2d'),
        img: any = new Image;

      img.crossOrigin = 'Anonymous';

      img.onload = () => {
        var dataURL: any = null;
        canvas.height = img.height;
        canvas.width = img.width;
        ctx.drawImage(img, 0, 0);

        // set image quality
        dataURL = canvas.toDataURL('image/jpeg', 0.9);
        canvas = null;
        resolve(dataURL);
      };

      img.onerror = (err) => {
        reject(err);
      };
      img.src = JSON.parse(url);
    });
  }

  isUndefined(value: any) {
    return typeof value === 'undefined';
  }

  isEmpty(value: any) {
    return this.isUndefined(value) || value === '' || value === null;
  }

  setImageToElement(el: ElementRef, imageBase64String: string) {
    el.nativeElement.src = imageBase64String;

    // if (element[0].nodeName === 'IMG') {
    //   element.attr('src', imageBase64String);
    // } else {
    //   element.css('background-image', 'url(' + imageBase64String + ')');
    // }
  }

  isUriAbsolute(uri: string) {
    let expression: any = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
    let regex = new RegExp(expression);
    return uri.match(regex);
  }
}