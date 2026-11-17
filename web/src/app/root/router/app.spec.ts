import {
  TestBed,
} from '@angular/core/testing';

import {
  provideRouter,
} from '@angular/router';

import {
  App,
} from './app';

describe(
  'App',
  (): void => {
    beforeEach(
      async (): Promise<void> => {
        await TestBed
          .configureTestingModule({
            imports: [
              App,
            ],

            providers: [
              provideRouter([]),
            ],
          })
          .compileComponents();
      },
    );

    it(
      'doit créer le composant racine',
      (): void => {
        const fixture =
          TestBed.createComponent(
            App,
          );

        expect(
          fixture.componentInstance,
        ).toBeTruthy();
      },
    );
  },
);
