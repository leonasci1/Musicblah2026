import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import { useUser } from '@lib/context/user-context';
import { useModal } from '@lib/hooks/useModal';
import { Button } from '@components/ui/button';
import { HeroIcon } from '@components/ui/hero-icon';
import { ToolTip } from '@components/ui/tooltip';
import { VerificationRequestModal } from '@components/modal/verification-request-modal';

export function RequestVerificationButton(): JSX.Element | null {
  const { user } = useUser();
  const { open, openModal, closeModal } = useModal();
  const [hasPendingRequest, setHasPendingRequest] = useState(false);

  useEffect(() => {
    const checkPendingRequest = async () => {
      if (!user?.id) return;

      try {
        const q = query(
          collection(db, 'verificationRequests'),
          where('userId', '==', user.id),
          where('status', '==', 'pending')
        );

        const snapshot = await getDocs(q);
        setHasPendingRequest(!snapshot.empty);
      } catch (error) {
        console.error('Erro ao verificar solicitação:', error);
      }
    };

    checkPendingRequest();
  }, [user?.id]);

  // Não mostra se já é verificado
  if (user?.verified) return null;

  return (
    <>
      <VerificationRequestModal open={open} closeModal={closeModal} />
      <Button
        className='dark-bg-tab group relative border border-light-line-reply p-2
                   hover:bg-light-primary/10 active:bg-light-primary/20 disabled:cursor-not-allowed 
                   disabled:opacity-50 dark:border-light-secondary
                   dark:hover:bg-dark-primary/10 dark:active:bg-dark-primary/20'
        onClick={openModal}
        disabled={hasPendingRequest}
      >
        <HeroIcon
          className='h-5 w-5'
          iconName='CheckBadgeIcon'
          solid={hasPendingRequest}
        />
        <ToolTip
          tip={
            hasPendingRequest ? 'Solicitação pendente' : 'Solicitar verificação'
          }
        />
      </Button>
    </>
  );
}
