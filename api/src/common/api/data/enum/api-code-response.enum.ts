export enum ApiCodeResponse {
 
  CommonSuccess = 'api.common.success',
  CommonError = 'api.common.error',
  CommonValidationError= 'api.common.validation.error',
  AccountNotFound = 'api.account.not.found',
  AuthIdentifierAlreadyExists ='api.auth.identifier.already-exists',
  AuthRegistrationIdentifierUnavailable = 'api.auth.registration.identifier.unavailable',
  AuthLoginInvalidCredentials = 'api.auth.login.invalid-credentials',

}