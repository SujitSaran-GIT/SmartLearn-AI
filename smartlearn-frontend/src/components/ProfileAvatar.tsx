import React from 'react';

interface User {
  firstName?: string;
  lastName?: string;
  email: string;
  profilePic?: string;
}

interface ProfileAvatarProps {
  user: User;
  size?: 'small' | 'medium' | 'large';
  showName?: boolean;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ 
  user, 
  size = 'medium', 
  showName = false 
}) => {
  const getInitials = () => {
    if (user.firstName || user.lastName) {
      return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
    }
    return user.email[0].toUpperCase();
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-8 h-8 text-xs';
      case 'large':
        return 'w-12 h-12 text-lg';
      default:
        return 'w-10 h-10 text-sm';
    }
  };

  return (
    <div className="flex items-center space-x-3">
      {showName && (
        <div className="flex flex-col text-right">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {user.firstName} {user.lastName}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {user.email}
          </span>
        </div>
      )}
      {user.profilePic ? (
        <img 
          src={user.profilePic} 
          alt={`${user.firstName} ${user.lastName}`}
          className={`rounded-full object-cover ${getSizeClasses()}`}
        />
      ) : (
        <div className={`rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold ${getSizeClasses()}`}>
          {getInitials()}
        </div>
      )}
      
    </div>
  );
};

export default ProfileAvatar;