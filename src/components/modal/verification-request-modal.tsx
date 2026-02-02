import { useState } from 'react';
import {
  addDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import { useAuth } from '@lib/context/auth-context';
import { Modal } from '@components/modal/modal';
import { Button } from '@components/ui/button';
import { HeroIcon } from '@components/ui/hero-icon';
import { toast } from 'react-hot-toast';

type VerificationRequestModalProps = {
  open: boolean;
  closeModal: () => void;
};

export function VerificationRequestModal({
  open,
  closeModal
}: VerificationRequestModalProps): JSX.Element {
  const { user } = useAuth();
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) return;

    if (reason.trim().length < 10) {
      toast.error('Por favor, escreva um motivo mais detalhado');
      return;
    }

    setIsLoading(true);

    try {
      // Verifica se já existe uma solicitação pendente
      const q = query(
        collection(db, 'verificationRequests'),
        where('userId', '==', user.id),
        where('status', '==', 'pending')
      );

      const existingRequest = await getDocs(q);

      if (!existingRequest.empty) {
        toast.error('Você já tem uma solicitação pendente');
        closeModal();
        return;
      }

      // Cria nova solicitação
      await addDoc(collection(db, 'verificationRequests'), {
        userId: user.id,
        userName: user.name,
        username: user.username,
        userPhotoURL: user.photoURL,
        reason: reason.trim(),
        status: 'pending',
        createdAt: serverTimestamp()
      });

      toast.success('Solicitação enviada! Aguarde a análise.');
      setReason('');
      closeModal();
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      toast.error('Erro ao enviar solicitação');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      closeModal={closeModal}
      modalClassName='max-w-md w-full bg-main-background rounded-2xl overflow-hidden'
    >
      <div className='p-4'>
        {/* Header */}
        <div className='mb-4 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <HeroIcon
              iconName='CheckBadgeIcon'
              className='h-6 w-6 text-main-accent'
            />
            <h2 className='text-lg font-bold text-light-primary dark:text-dark-primary'>
              Solicitar Verificação
            </h2>
          </div>
          <button
            onClick={closeModal}
            className='rounded-full p-2 hover:bg-light-primary/10 dark:hover:bg-dark-primary/10'
          >
            <HeroIcon iconName='XMarkIcon' className='h-5 w-5' />
          </button>
        </div>

        {/* Info */}
        <div className='mb-4 rounded-xl bg-main-accent/10 p-3'>
          <p className='text-sm text-light-primary dark:text-dark-primary'>
            O selo de verificação indica que a conta é autêntica e pertence a um
            usuário notável ou membro beta do MusicBlah.
          </p>
        </div>

        {/* Textarea */}
        <div className='mb-4'>
          <label className='mb-2 block text-sm font-medium text-light-secondary dark:text-dark-secondary'>
            Por que você deve ser verificado?
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder='Descreva por que você merece o selo de verificação...'
            className='h-32 w-full resize-none rounded-xl border border-light-border bg-transparent 
                       p-3 text-light-primary outline-none
                       placeholder:text-light-secondary focus:border-main-accent
                       focus:ring-1 focus:ring-main-accent dark:border-dark-border dark:text-dark-primary dark:placeholder:text-dark-secondary'
            maxLength={500}
          />
          <p className='mt-1 text-xs text-light-secondary dark:text-dark-secondary'>
            {reason.length}/500 caracteres
          </p>
        </div>

        {/* Buttons */}
        <div className='flex gap-3'>
          <Button
            onClick={closeModal}
            className='flex-1 rounded-full border border-light-line-reply py-2.5 font-bold
                       text-light-primary hover:bg-light-primary/10 dark:border-dark-line-reply dark:text-dark-primary dark:hover:bg-dark-primary/10'
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || reason.trim().length < 10}
            className='flex-1 rounded-full bg-main-accent py-2.5 font-bold text-white
                       hover:bg-main-accent/90 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {isLoading ? 'Enviando...' : 'Enviar Solicitação'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
