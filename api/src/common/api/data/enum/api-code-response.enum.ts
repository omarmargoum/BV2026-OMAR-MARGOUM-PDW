export enum ApiCodeResponse {
 
  CommonSuccess = 'api.common.success',
  CommonError = 'api.common.error',
  CommonValidationError= 'api.common.validation.error',
  AccountNotFound = 'api.account.not.found',
  AuthIdentifierAlreadyExists ='api.auth.identifier.already-exists',
  AuthRegistrationIdentifierUnavailable = 'api.auth.registration.identifier.unavailable',
  AuthRefreshTokenInvalid ='api.auth.refresh-token.invalid',
  AuthLoginInvalidCredentials = 'api.auth.login.invalid-credentials',
  AuthLogoutSuccess = 'api.auth.logout.success',
  AuthAccessUnauthorized = 'api.auth.access.unauthorized',
  AuthRefreshTokenReuseDetected ='api.auth.refresh-token.reuse-detected', 
}