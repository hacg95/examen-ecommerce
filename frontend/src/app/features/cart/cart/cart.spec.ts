import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Cart } from './cart';
import { CartService } from '../services/cart';
import { of } from 'rxjs';

describe('Cart', () => {
  let component: Cart;
  let fixture: ComponentFixture<Cart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cart],
      providers: [provideRouter([]), {
          provide: CartService,
          useValue: { getCart: () => of({ items: [], subtotal: 0, discount: 0, discountPercentage: 0, total: 0, appliedDiscounts: [] }) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Cart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
