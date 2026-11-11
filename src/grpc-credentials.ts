import { credentials, Metadata } from '@grpc/grpc-js';

export function createInsecureGrpcCredentials() {
  return credentials.createInsecure();
}

export function createGrpcMetadata() {
  return new Metadata();
}
