import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc
} from 'firebase/firestore';
import type { Timestamp } from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import { useAuth } from '@lib/context/auth-context';
import { MainLayout } from '@components/layout/main-layout';
import { MainHeader } from '@components/home/main-header';
import { MainContainer } from '@components/home/main-container';
import { SEO } from '@components/common/seo';
import { Loading } from '@components/ui/loading';
import { HeroIcon } from '@components/ui/hero-icon';
import { Button } from '@components/ui/button';

// IDs dos administradores (adicione mais IDs conforme necessário)
const ADMIN_IDS = [
  '6zKhNMo9djbcehg7IavUe31h2pv2',
  'MqwowrLJgKdrPX8YNP4CxEWvXmz2'
];

type VerificationRequest = {
  id: string;
  userId: string;
  userName: string;
  username: string;
  userPhotoURL: string | null;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Timestamp;
};

export default function AdminPage(): JSX.Element {
  const { user } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = user?.id && ADMIN_IDS.includes(user.id);

  useEffect(() => {
    if (!user) return;

    if (!isAdmin) {
      router.push('/home');
      return;
    }

    const fetchRequests = async () => {
      try {
        // Query simplificada - ordenação feita no client
        const q = query(
          collection(db, 'verificationRequests'),
          where('status', '==', 'pending')
        );

        const snapshot = await getDocs(q);
        console.log('📋 Solicitações encontradas:', snapshot.docs.length);

        const data = snapshot.docs.map((doc) => {
          console.log('📄 Doc:', doc.id, doc.data());
          return {
            id: doc.id,
            ...doc.data()
          };
        }) as VerificationRequest[];

        // Ordenar no client (mais recentes primeiro)
        data.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB.getTime() - dateA.getTime();
        });

        setRequests(data);
      } catch (error) {
        console.error('Erro ao buscar solicitações:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [user, isAdmin, router]);

  const handleApprove = async (request: VerificationRequest) => {
    try {
      // Atualiza o usuário como verificado
      await updateDoc(doc(db, 'users', request.userId), {
        verified: true
      });

      // Atualiza o status da solicitação
      await updateDoc(doc(db, 'verificationRequests', request.id), {
        status: 'approved'
      });

      // Remove da lista
      setRequests((prev) => prev.filter((r) => r.id !== request.id));

      toast.success(`@${request.username} foi verificado!`);
    } catch (error) {
      console.error('Erro ao aprovar:', error);
      toast.error('Erro ao aprovar solicitação');
    }
  };

  const handleReject = async (request: VerificationRequest) => {
    try {
      // Atualiza o status da solicitação
      await updateDoc(doc(db, 'verificationRequests', request.id), {
        status: 'rejected'
      });

      // Remove da lista
      setRequests((prev) => prev.filter((r) => r.id !== request.id));

      toast.success(`Solicitação de @${request.username} rejeitada`);
    } catch (error) {
      console.error('Erro ao rejeitar:', error);
      toast.error('Erro ao rejeitar solicitação');
    }
  };

  if (!user || !isAdmin) {
    return (
      <MainContainer>
        <SEO title='Admin / MusicBlah' />
        <MainHeader title='Acesso Negado' />
        <div className='flex flex-col items-center justify-center py-20'>
          <HeroIcon
            iconName='ShieldExclamationIcon'
            className='h-16 w-16 text-light-secondary dark:text-dark-secondary'
          />
          <p className='mt-4 text-light-secondary dark:text-dark-secondary'>
            Você não tem permissão para acessar esta página.
          </p>
        </div>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <SEO title='Admin - Verificações / MusicBlah' />
      <MainHeader title='Painel Admin' />

      <div className='border-b border-light-border px-4 py-4 dark:border-dark-border'>
        <h2 className='text-lg font-bold text-light-primary dark:text-dark-primary'>
          Solicitações de Verificação
        </h2>
        <p className='text-sm text-light-secondary dark:text-dark-secondary'>
          {requests.length} solicitação(ões) pendente(s)
        </p>
      </div>

      {isLoading ? (
        <Loading className='py-8' />
      ) : requests.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-20'>
          <HeroIcon
            iconName='CheckBadgeIcon'
            className='h-16 w-16 text-light-secondary dark:text-dark-secondary'
          />
          <p className='mt-4 text-light-secondary dark:text-dark-secondary'>
            Nenhuma solicitação pendente
          </p>
        </div>
      ) : (
        <div className='divide-y divide-light-border dark:divide-dark-border'>
          {requests.map((request) => (
            <div key={request.id} className='p-4'>
              <div className='flex items-start gap-3'>
                {/* Avatar */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={request.userPhotoURL || '/assets/default-avatar.png'}
                  alt={request.userName}
                  className='h-12 w-12 rounded-full object-cover'
                />

                <div className='min-w-0 flex-1'>
                  <div className='flex items-center gap-2'>
                    <span className='font-bold text-light-primary dark:text-dark-primary'>
                      {request.userName}
                    </span>
                    <span className='text-light-secondary dark:text-dark-secondary'>
                      @{request.username}
                    </span>
                  </div>

                  <p className='mt-1 text-light-primary dark:text-dark-primary'>
                    {request.reason}
                  </p>

                  <p className='mt-1 text-xs text-light-secondary dark:text-dark-secondary'>
                    {request.createdAt
                      ?.toDate?.()
                      ?.toLocaleDateString('pt-BR') || 'Data não disponível'}
                  </p>

                  {/* Botões */}
                  <div className='mt-3 flex gap-2'>
                    <Button
                      className='rounded-full bg-green-500 px-4 py-2 text-sm font-bold text-white hover:bg-green-600'
                      onClick={() => handleApprove(request)}
                    >
                      <HeroIcon iconName='CheckIcon' className='mr-1 h-4 w-4' />
                      Aprovar
                    </Button>
                    <Button
                      className='rounded-full bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-600'
                      onClick={() => handleReject(request)}
                    >
                      <HeroIcon iconName='XMarkIcon' className='mr-1 h-4 w-4' />
                      Rejeitar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </MainContainer>
  );
}

AdminPage.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};

// Forçar SSR para evitar problemas com window durante build
export function getServerSideProps() {
  return { props: {} };
}
