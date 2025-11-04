'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Award, Gift, Star, TrendingUp, Users, Zap, Trophy, Crown } from 'lucide-react';

export default function RewardsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'rewards' | 'history'>('rewards');

  // Mock data - in real app, this would come from API
  const userPoints = 1250;
  const nextRewardPoints = 1500;
  const progress = (userPoints / nextRewardPoints) * 100;

  const availableRewards = [
    {
      id: '1',
      title: 'Free Delivery',
      description: 'Get free delivery on your next order',
      points: 500,
      icon: Zap,
      color: 'secondary',
      available: true,
    },
    {
      id: '2',
      title: '20% Off',
      description: 'Get 20% off on orders above $25',
      points: 800,
      icon: Gift,
      color: 'accent',
      available: true,
    },
    {
      id: '3',
      title: '$10 Off',
      description: 'Get $10 off on your next order',
      points: 1000,
      icon: Star,
      color: 'primary',
      available: true,
    },
    {
      id: '4',
      title: 'Premium Member',
      description: 'Unlock premium benefits for 30 days',
      points: 2000,
      icon: Crown,
      color: 'status-warning',
      available: false,
    },
  ];

  const achievements = [
    { id: '1', name: 'First Order', earned: true, icon: Trophy },
    { id: '2', name: '5 Orders', earned: true, icon: Star },
    { id: '3', name: '10 Orders', earned: true, icon: Award },
    { id: '4', name: 'Refer a Friend', earned: false, icon: Users },
    { id: '5', name: '25 Orders', earned: false, icon: TrendingUp },
  ];

  const pointsHistory = [
    { date: '2025-10-25', description: 'Order #12345', points: '+150' },
    { date: '2025-10-23', description: 'Referral Bonus', points: '+500' },
    { date: '2025-10-20', description: 'Order #12344', points: '+120' },
    { date: '2025-10-18', description: 'Redeemed: Free Delivery', points: '-500' },
    { date: '2025-10-15', description: 'Order #12343', points: '+180' },
  ];

  const redeemReward = (reward: any) => {
    if (reward.available && userPoints >= reward.points) {
      // Implement redemption logic
      alert(`Redeeming: ${reward.title}`);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-background pb-20">
      {/* Header */}
      <div className="gradient-primary text-white p-4 shadow-elevated animate-slide-down">
        <div className="flex items-center mb-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/10 rounded-full active:scale-95 transition-all mr-2"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">Rewards & Points</h1>
        </div>

        {/* Points Card */}
        <div className="bg-white/10 backdrop-blur-md glass rounded-lg p-4 animate-scale-in">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm opacity-90">Your Points</p>
              <h2 className="text-4xl font-bold">{userPoints}</h2>
            </div>
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center">
              <Star size={32} className="text-neutral-text-primary fill-neutral-text-primary" />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span>Next reward at {nextRewardPoints} points</span>
              <span>{nextRewardPoints - userPoints} to go</span>
            </div>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent transition-all duration-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-neutral-border flex">
        <button
          onClick={() => setActiveTab('rewards')}
          className={`flex-1 py-3 font-semibold transition-all ${
            activeTab === 'rewards'
              ? 'text-primary border-b-2 border-primary'
              : 'text-neutral-text-secondary'
          }`}
        >
          Available Rewards
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 font-semibold transition-all ${
            activeTab === 'history'
              ? 'text-primary border-b-2 border-primary'
              : 'text-neutral-text-secondary'
          }`}
        >
          Points History
        </button>
      </div>

      <div className="p-4 space-y-4">
        {activeTab === 'rewards' ? (
          <>
            {/* Achievements */}
            <div className="bg-white rounded-md p-4 shadow-md animate-slide-up">
              <h3 className="font-bold text-neutral-text-primary mb-3 flex items-center gap-2">
                <Trophy size={20} className="text-accent" />
                Achievements
              </h3>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                {achievements.map((achievement, index) => (
                  <div
                    key={achievement.id}
                    className={`flex-shrink-0 w-20 text-center animate-scale-in ${
                      achievement.earned ? 'opacity-100' : 'opacity-40'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div
                      className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-2 ${
                        achievement.earned
                          ? 'bg-accent'
                          : 'bg-neutral-border'
                      }`}
                    >
                      <achievement.icon size={28} className="text-neutral-text-primary" />
                    </div>
                    <p className="text-xs font-medium text-neutral-text-secondary">
                      {achievement.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Referral Card */}
            <div className="bg-gradient-to-br from-secondary-light to-primary-light rounded-md p-6 shadow-md animate-slide-up" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                  <Users size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-neutral-text-primary">Invite Friends</h3>
                  <p className="text-sm text-neutral-text-secondary">Get 500 points for each referral</p>
                </div>
              </div>
              <button className="w-full gradient-secondary text-white py-3 rounded-md font-semibold shadow-md hover-lift ripple">
                Share Referral Code
              </button>
            </div>

            {/* Available Rewards */}
            <div className="space-y-3">
              {availableRewards.map((reward, index) => {
                const Icon = reward.icon;
                const canRedeem = reward.available && userPoints >= reward.points;
                
                return (
                  <div
                    key={reward.id}
                    className="bg-white rounded-md p-4 shadow-md animate-slide-up"
                    style={{ animationDelay: `${(index + 2) * 50}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 bg-${reward.color}-light rounded-full flex items-center justify-center flex-shrink-0`}>
                        <Icon size={28} className={`text-${reward.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-neutral-text-primary">{reward.title}</h3>
                        <p className="text-sm text-neutral-text-secondary mb-2">{reward.description}</p>
                        <div className="flex items-center gap-2">
                          <Star size={14} className="text-accent fill-accent" />
                          <span className="text-sm font-semibold text-accent">{reward.points} points</span>
                        </div>
                      </div>
                      <button
                        onClick={() => redeemReward(reward)}
                        disabled={!canRedeem}
                        className={`px-4 py-2 rounded-md font-semibold transition-all ${
                          canRedeem
                            ? 'gradient-primary text-white hover-lift'
                            : 'bg-neutral-border text-neutral-text-secondary cursor-not-allowed'
                        }`}
                      >
                        {canRedeem ? 'Redeem' : 'Locked'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Points History */
          <div className="bg-white rounded-md shadow-md overflow-hidden animate-slide-up">
            <div className="divide-y divide-neutral-border">
              {pointsHistory.map((item, index) => (
                <div
                  key={index}
                  className="p-4 flex items-center justify-between hover:bg-neutral-background transition-all"
                >
                  <div>
                    <p className="font-medium text-neutral-text-primary">{item.description}</p>
                    <p className="text-xs text-neutral-text-secondary mt-1">{item.date}</p>
                  </div>
                  <span
                    className={`font-bold text-lg ${
                      item.points.startsWith('+') ? 'text-status-success' : 'text-status-error'
                    }`}
                  >
                    {item.points}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

