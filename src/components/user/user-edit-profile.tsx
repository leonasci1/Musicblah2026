import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import cn from 'clsx';
import { useUser } from '@lib/context/user-context';
import { useModal } from '@lib/hooks/useModal';
import { updateUserData, uploadImages } from '@lib/firebase/utils';
import { sleep } from '@lib/utils';
import { getImagesData } from '@lib/validation';
import { Modal } from '@components/modal/modal';
import { EditProfileModal } from '@components/modal/edit-profile-modal';
import { Button } from '@components/ui/button';
import { InputField } from '@components/input/input-field';
import type { ChangeEvent, KeyboardEvent } from 'react';
import type { FilesWithId } from '@lib/types/file';
import type { User, EditableData, EditableUserData } from '@lib/types/user';
import type { InputFieldProps } from '@components/input/input-field';

type RequiredInputFieldProps = Omit<InputFieldProps, 'handleChange'> & {
  inputId: EditableData;
};

type UserImages = Record<
  Extract<EditableData, 'photoURL' | 'coverPhotoURL'>,
  FilesWithId
>;

type TrimmedTexts = Pick<
  EditableUserData,
  Exclude<EditableData, 'photoURL' | 'coverPhotoURL'>
>;

type UserEditProfileProps = {
  hide?: boolean;
};

export function UserEditProfile({ hide }: UserEditProfileProps): JSX.Element {
  const { user } = useUser();
  const { open, openModal, closeModal } = useModal();

  const [loading, setLoading] = useState(false);

  // 1. Recuperar dados atuais do usuário, incluindo os novos campos musicais
  const {
    bio,
    name,
    website,
    location,
    photoURL,
    coverPhotoURL,
    favoriteArtist,
    musicGenres,
    favoriteAlbum,
    favoriteTrack
  } = user as User;

  // 2. Inicializar o estado com os campos existentes e os novos
  const [editUserData, setEditUserData] = useState<EditableUserData>({
    bio,
    name,
    website,
    photoURL,
    location,
    coverPhotoURL,
    favoriteArtist: favoriteArtist ?? '',
    musicGenres: musicGenres ?? '',
    favoriteAlbum: favoriteAlbum ?? '',
    favoriteTrack: favoriteTrack ?? ''
  });

  const [userImages, setUserImages] = useState<UserImages>({
    photoURL: [],
    coverPhotoURL: []
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => cleanImage, []);

  const inputNameError = !editUserData.name?.trim()
    ? "Name can't be blank"
    : '';

  const updateData = async (): Promise<void> => {
    setLoading(true);

    const userId = user?.id as string;

    const { photoURL, coverPhotoURL: coverURL } = userImages;

    const [newPhotoURL, newCoverPhotoURL] = await Promise.all(
      [photoURL, coverURL].map((image) => uploadImages(userId, image))
    );

    const newImages: Partial<Pick<User, 'photoURL' | 'coverPhotoURL'>> = {
      coverPhotoURL:
        coverPhotoURL === editUserData.coverPhotoURL
          ? coverPhotoURL
          : newCoverPhotoURL?.[0].src ?? null,
      ...(newPhotoURL && { photoURL: newPhotoURL[0].src })
    };

    // 3. Adicionar as chaves dos novos campos na lista de dados a serem salvos
    const trimmedKeys: Readonly<EditableData[]> = [
      'name',
      'bio',
      'location',
      'website',
      'favoriteArtist',
      'musicGenres',
      'favoriteAlbum',
      'favoriteTrack'
    ];

    const trimmedTexts = trimmedKeys.reduce(
      (acc, curr) => ({ ...acc, [curr]: editUserData[curr]?.trim() ?? null }),
      {} as TrimmedTexts
    );

    const newUserData: Readonly<EditableUserData> = {
      ...editUserData,
      ...trimmedTexts,
      ...newImages
    };

    await sleep(500);

    await updateUserData(userId, newUserData);

    closeModal();

    cleanImage();

    setLoading(false);
    setEditUserData(newUserData);

    toast.success('Perfil atualizado com sucesso!');
  };

  const editImage =
    (type: 'cover' | 'profile') =>
    ({ target: { files } }: ChangeEvent<HTMLInputElement>): void => {
      const imagesData = getImagesData(files);

      if (!imagesData) {
        toast.error('Please choose a valid GIF or Photo');
        return;
      }

      const { imagesPreviewData, selectedImagesData } = imagesData;

      const targetKey = type === 'cover' ? 'coverPhotoURL' : 'photoURL';
      const newImage = imagesPreviewData[0].src;

      setEditUserData({
        ...editUserData,
        [targetKey]: newImage
      });

      setUserImages({
        ...userImages,
        [targetKey]: selectedImagesData
      });
    };

  const removeCoverImage = (): void => {
    setEditUserData({
      ...editUserData,
      coverPhotoURL: null
    });

    setUserImages({
      ...userImages,
      coverPhotoURL: []
    });

    URL.revokeObjectURL(editUserData.coverPhotoURL ?? '');
  };

  const cleanImage = (): void => {
    const imagesKey: Readonly<Partial<EditableData>[]> = [
      'photoURL',
      'coverPhotoURL'
    ];

    imagesKey.forEach((image) =>
      URL.revokeObjectURL(editUserData[image] ?? '')
    );

    setUserImages({
      photoURL: [],
      coverPhotoURL: []
    });
  };

  const resetUserEditData = (): void =>
    setEditUserData({
      bio,
      name,
      website,
      photoURL,
      location,
      coverPhotoURL,
      // 4. Resetar também os campos musicais
      favoriteArtist,
      musicGenres,
      favoriteAlbum,
      favoriteTrack
    });

  const handleChange =
    (key: EditableData) =>
    ({
      target: { value }
    }: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setEditUserData({ ...editUserData, [key]: value });

  const handleKeyboardShortcut = ({
    key,
    target,
    ctrlKey
  }: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    if (ctrlKey && key === 'Enter' && !inputNameError) {
      target.blur();
      void updateData();
    }
  };

  // 5. Configurar os inputs visuais para o formulário
  const inputFields: Readonly<RequiredInputFieldProps[]> = [
    {
      label: 'Name',
      inputId: 'name',
      inputValue: editUserData.name,
      inputLimit: 50,
      errorMessage: inputNameError
    },
    {
      label: 'Bio',
      inputId: 'bio',
      inputValue: editUserData.bio,
      inputLimit: 160,
      useTextArea: true
    },
    {
      label: 'Location',
      inputId: 'location',
      inputValue: editUserData.location,
      inputLimit: 30
    },
    {
      label: 'Website',
      inputId: 'website',
      inputValue: editUserData.website,
      inputLimit: 100
    },
    // --- Campos Musicais Novos ---
    // ADICIONADO '?? null' PARA CORRIGIR O ERRO DE TIPO
    {
      label: 'Artista Favorito',
      inputId: 'favoriteArtist',
      inputValue: editUserData.favoriteArtist ?? null,
      inputLimit: 50
    },
    {
      label: 'Gêneros (ex: Rock, Pop)',
      inputId: 'musicGenres',
      inputValue: editUserData.musicGenres ?? null,
      inputLimit: 100
    },
    {
      label: 'Álbum Top 1',
      inputId: 'favoriteAlbum',
      inputValue: editUserData.favoriteAlbum ?? null,
      inputLimit: 50
    },
    {
      label: 'Música no Repeat',
      inputId: 'favoriteTrack',
      inputValue: editUserData.favoriteTrack ?? null,
      inputLimit: 50
    }
  ];

  return (
    <form className={cn(hide && 'hidden md:block')}>
      <Modal
        modalClassName='relative bg-main-background rounded-2xl max-w-xl w-full h-[672px] overflow-hidden'
        open={open}
        closeModal={closeModal}
      >
        <EditProfileModal
          name={name}
          loading={loading}
          photoURL={editUserData.photoURL}
          coverPhotoURL={editUserData.coverPhotoURL}
          inputNameError={inputNameError}
          editImage={editImage}
          closeModal={closeModal}
          updateData={updateData}
          removeCoverImage={removeCoverImage}
          resetUserEditData={resetUserEditData}
        >
          {inputFields.map((inputData) => (
            <InputField
              {...inputData}
              handleChange={handleChange(inputData.inputId)}
              handleKeyboardShortcut={handleKeyboardShortcut}
              key={inputData.inputId}
            />
          ))}
        </EditProfileModal>
      </Modal>
      <Button
        className='dark-bg-tab self-start border border-light-line-reply px-4 py-1.5 font-bold
                   hover:bg-light-primary/10 active:bg-light-primary/20 dark:border-light-secondary
                   dark:hover:bg-dark-primary/10 dark:active:bg-dark-primary/20'
        onClick={openModal}
      >
        Edit profile
      </Button>
    </form>
  );
}
