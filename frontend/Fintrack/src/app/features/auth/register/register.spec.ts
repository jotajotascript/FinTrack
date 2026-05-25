//import { describe, it, expect } from 'vitest';

//describe('RegisterComponent', () => {
//  it('should pass', () => {
//    expect(true).toBe(true);
//  });
//});

//import { ComponentFixture, TestBed } from '@angular/core/testing';

//import { Register } from './register';

//describe('Register', () => {
 // let component: Register;
 // let fixture: ComponentFixture<Register>;

  //beforeEach(async () => {
   // await TestBed.configureTestingModule({
    //  imports: [Register],
   // }).compileComponents();

   // fixture = TestBed.createComponent(Register);
   // component = fixture.componentInstance;
   // await fixture.whenStable();
 // });

  //it('should create', () => {
    //expect(component).toBeTruthy();
  //});
//});

//Adição de teste 25/05

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { RegisterComponent } from './register.component';
import { AuthService } from '../../../core/services/auth';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  const authServiceMock = {
    register: async () => {}
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: authServiceMock
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
