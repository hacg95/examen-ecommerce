import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductList } from './product-list';
import { Products } from '../services/products';

describe('ProductList', () => {
  let component: ProductList;
  let fixture: ComponentFixture<ProductList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductList],
      providers: [
        {
          provide: Products,
          useValue: { getAll: () => ({ subscribe: () => undefined }) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
