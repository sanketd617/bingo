import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { environment } from "src/environments/environment";
import { AngularFireModule } from "@angular/fire";
import { AngularFirestoreModule } from "@angular/fire/firestore";
import { AngularFireAuthModule } from '@angular/fire/auth';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { GameComponent } from './game/game.component';
import { HomeComponent } from './home/home.component';
import { SelectionSheetComponent } from './selection-sheet/selection-sheet.component';
import { NotificationPanelComponent } from './notification-panel/notification-panel.component';

@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    HomeComponent,
    SelectionSheetComponent,
    NotificationPanelComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    AngularFireAuthModule,
    FontAwesomeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
