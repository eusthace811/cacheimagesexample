import {Injectable} from '@angular/core';
import { Platform } from 'ionic-angular';
import { SQLite } from 'ionic-native';

@Injectable()
export class PhotosService {

  // SQLite
  db: any = null;

  // Init an empty DB if it does not exist by now!
  constructor(public platform: Platform) {
    this.platform.ready().then(() => {
      this.db = new SQLite();
      this.db.openDatabase({ name: 'cache.db', location: 'default' }).then(() => {
        this.db.executeSql('CREATE TABLE IF NOT EXISTS photos (id INTEGER PRIMARY KEY AUTOINCREMENT, url TEXT NOT NULL UNIQUE, imageBase64String TEXT)', {}).then(() => {}, (err) => { 
          console.error('Unable to execute sql: ', err);
        });
      }, (err) => {
        console.error('Unable to open database: ', err);
      });
    });
  }

  // Find a photo in our DB
  public findPhotoByURL(url: string) {
    let sql = 'SELECT imageBase64String FROM photos WHERE url = \"' + url + '\" limit 1';
    return this.db.executeSql(sql);
  }

  // Save a new photo to the DB
  public savePhoto(url: string, imageBase64String: string) {
    let sql = 'INSERT INTO photos (url, imageBase64String) VALUES (?,?)';
    return this.db.executeSql(sql, [url, imageBase64String]);
  }
}

