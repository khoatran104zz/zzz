'use client';

import React, { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, Users, ArrowRight, ShieldCheck } from 'lucide-react';
import { useGetInvitation, useAcceptInvitation } from '@/features/workspace/hooks/use-workspace';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';

export default function AcceptInvitationPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;
  const router = useRouter();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: invitation, isLoading, isError } = useGetInvitation(token);
  const acceptMutation = useAcceptInvitation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/invite/${token}` as any);
      return;
    }

    if (invitation && !acceptMutation.isPending && !acceptMutation.isSuccess && !acceptMutation.isError) {
      acceptMutation.mutate(token, {
        onSuccess: (wsMember) => {
          toast.success('Đã chấp nhận lời mời tham gia Workspace!');
          if (wsMember?.workspaceId) {
            router.push(`/workspaces/${wsMember.workspaceId}` as any);
          } else {
            router.push('/workspaces' as any);
          }
        },
        onError: (err: any) => {
          setErrorMsg(err.response?.data?.message || 'Không thể chấp nhận lời mời tham gia');
        },
      });
    }
  }, [isAuthenticated, invitation, token, acceptMutation, router]);

  if (isLoading || acceptMutation.isPending) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#090d16] p-4 text-white">
        <div className="flex flex-col items-center space-y-4 rounded-3xl border border-white/10 bg-gray-900/80 p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
          <div className="text-center space-y-1">
            <h2 className="text-base font-bold text-white font-heading">Đang tham gia Workspace...</h2>
            <p className="text-xs text-gray-400">Vui lòng chờ trong giây lát</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !invitation) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#090d16] p-4 text-white">
        <div className="w-full max-w-md space-y-4 rounded-3xl border border-red-500/20 bg-gray-900/80 p-8 text-center backdrop-blur-xl">
          <h2 className="text-lg font-bold text-red-400 font-heading">Liên kết đã hết hạn hoặc không hợp lệ</h2>
          <p className="text-xs text-gray-400">
            Lời mời tham gia Workspace này không tồn tại hoặc đã hết hiệu lực. Vui lòng yêu cầu Quản trị viên gửi lại liên kết mới.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full rounded-xl bg-white/10 py-2.5 text-xs font-semibold text-white hover:bg-white/20 transition"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#090d16] p-4 text-white">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-white/10 bg-gray-900/80 p-8 text-center backdrop-blur-xl shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 shadow-xl border border-emerald-500/30">
          <ShieldCheck className="h-7 w-7" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-xl font-bold text-white font-heading">Chấp nhận yêu cầu vào Workspace</h1>
          <p className="text-xs text-gray-400">
            Bạn đã được mời tham gia Workspace trên hệ thống <strong className="text-white">TaskFlow</strong>.
          </p>
        </div>

        {errorMsg && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
            {errorMsg}
          </div>
        )}

        <button
          onClick={() => {
            acceptMutation.mutate(token, {
              onSuccess: (wsMember) => {
                toast.success('Đã chấp nhận lời mời!');
                router.push(wsMember?.workspaceId ? (`/workspaces/${wsMember.workspaceId}` as any) : ('/workspaces' as any));
              },
            });
          }}
          disabled={acceptMutation.isPending}
          className="flex w-full items-center justify-center space-x-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-500 disabled:opacity-50 active:scale-[0.98]"
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>Chấp nhận tham gia</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
