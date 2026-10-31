import {
  SetMetadata,
} from '@nestjs/common';

export const IS_PUBLIC_KEY =
  'authentication.is-public';

export const Public = ():
  MethodDecorator &
  ClassDecorator =>
    SetMetadata(
      IS_PUBLIC_KEY,
      true,
    );