'use client';

import { useMutation } from '@tanstack/react-query';
import { customerAuthService } from '@/services/customer-auth.service';
import { customerInfoService } from '@/services/customer-info.service';

export function useLogin() {
  return useMutation({
    mutationFn: customerAuthService.customerLogin,
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: customerInfoService.createAccount,
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: customerAuthService.customerLogout,
  });
}
