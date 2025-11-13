'use client'

import { useMsal } from "@azure/msal-react";
import { loginRequest } from "@/lib/msalConfig";
import { graphConfig } from "@/lib/graphConfig";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface ProfileData {
  id: string;
  displayName?: string;
  givenName?: string;
  surname?: string;
  mail?: string;
  userPrincipalName?: string;
  jobTitle?: string;
  department?: string;
  [key: string]: unknown;
}

interface Colleague {
  id: string;
  displayName?: string;
  mail?: string;
  userPrincipalName?: string;
  jobTitle?: string;
  department?: string;
}

const PROFILE_SELECT = "id,displayName,givenName,surname,mail,userPrincipalName,jobTitle,department";

export default function Profile() {
  const { instance, accounts } = useMsal();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [myProfile, setMyProfile] = useState<ProfileData | null>(null);
  const [myProfileId, setMyProfileId] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const avatarUrlRef = useRef<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [colleagues, setColleagues] = useState<Colleague[]>([]);
  const [colleaguesLoading, setColleaguesLoading] = useState(false);
  const [colleaguesError, setColleaguesError] = useState<string | null>(null);
  const colleaguesLoadedRef = useRef(false);

  const colleaguesToDisplay = useMemo(() => {
    if (!myProfileId) {
      return colleagues;
    }
    return colleagues.filter((colleague) => colleague.id !== myProfileId);
  }, [colleagues, myProfileId]);

  useEffect(() => {
    return () => {
      if (avatarUrlRef.current) {
        URL.revokeObjectURL(avatarUrlRef.current);
      }
    };
  }, []);

  const updateAvatarUrl = (url: string | null) => {
    if (avatarUrlRef.current) {
      URL.revokeObjectURL(avatarUrlRef.current);
    }
    avatarUrlRef.current = url;
    setAvatarUrl(url);
  };

  useEffect(() => {
    const activeAccount = instance.getActiveAccount() ?? accounts[0];
    if (!activeAccount) {
      router.push("/");
    }
  }, [accounts, instance, router]);

  useEffect(() => {
    const activeAccount = instance.getActiveAccount() ?? accounts[0];
    if (!activeAccount || myProfile) {
      return;
    }

    let isMounted = true;

    const fetchMyProfile = async () => {
      try {
        const tokenResponse = await instance.acquireTokenSilent({
          ...loginRequest,
          account: activeAccount,
        });

        const headers = {
          Authorization: `Bearer ${tokenResponse.accessToken}`,
        };

        const response = await fetch(`${graphConfig.graphMeEndpoint}?$select=${PROFILE_SELECT}`, {
          headers,
        });

        if (!response.ok) {
          throw new Error("無法取得個人資料");
        }

        const data: ProfileData = await response.json();

        if (!isMounted) {
          return;
        }

        setMyProfile(data);
        setMyProfileId(data.id);
      } catch (error) {
        console.error("取得個人資料失敗:", error);
      }
    };

    fetchMyProfile();

    return () => {
      isMounted = false;
    };
  }, [accounts, instance, myProfile]);

  useEffect(() => {
    const activeAccount = instance.getActiveAccount() ?? accounts[0];
    if (!activeAccount) {
      return;
    }

    let isMounted = true;

    const fetchProfile = async () => {
      setProfileLoading(true);
      setProfileError(null);

      try {
        const tokenResponse = await instance.acquireTokenSilent({
          ...loginRequest,
          account: activeAccount,
        });

        const baseHeaders = {
          Authorization: `Bearer ${tokenResponse.accessToken}`,
        };

        let profileData: ProfileData | null = null;

        if (!userId && myProfile) {
          profileData = myProfile;
        }

        if (!profileData) {
          const profileEndpoint = userId
            ? `${graphConfig.graphUsersEndpoint}/${userId}?$select=${PROFILE_SELECT}`
            : `${graphConfig.graphMeEndpoint}?$select=${PROFILE_SELECT}`;

          const profileResponse = await fetch(profileEndpoint, {
            headers: baseHeaders,
          });

          if (!profileResponse.ok) {
            throw new Error("無法取得個人資料");
          }

          profileData = await profileResponse.json();

          if (!profileData) {
            throw new Error("未取得個人資料");
          }

          if (!userId && isMounted) {
            setMyProfile(profileData);
            if (profileData.id) {
              setMyProfileId(profileData.id);
            }
          }
        }

        if (!profileData || !isMounted) {
          return;
        }

        setProfile(profileData);

        const photoEndpoint = userId
          ? `${graphConfig.graphUsersEndpoint}/${userId}/photo/$value`
          : graphConfig.graphMePhotoEndpoint;

        const photoResponse = await fetch(photoEndpoint, {
          headers: baseHeaders,
        });

        if (photoResponse.ok) {
          const blob = await photoResponse.blob();
          if (blob.size > 0) {
            const url = URL.createObjectURL(blob);
            if (isMounted) {
              updateAvatarUrl(url);
            }
          } else {
            updateAvatarUrl(null);
          }
        } else if (photoResponse.status === 404) {
          updateAvatarUrl(null);
        }
      } catch (error) {
        console.error("取得個人資料失敗:", error);
        if (isMounted) {
          setProfileError((error as Error).message || "發生錯誤，請稍後再試");
        }
      } finally {
        if (isMounted) {
          setProfileLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [accounts, instance, userId]);

  useEffect(() => {
    const activeAccount = instance.getActiveAccount() ?? accounts[0];
    if (!activeAccount || colleaguesLoadedRef.current) {
      return;
    }

    colleaguesLoadedRef.current = true;
    let isMounted = true;

    const fetchColleagues = async () => {
      setColleaguesLoading(true);
      setColleaguesError(null);

      try {
        const tokenResponse = await instance.acquireTokenSilent({
          ...loginRequest,
          account: activeAccount,
        });

        const headers = {
          Authorization: `Bearer ${tokenResponse.accessToken}`,
        };

        const users: Colleague[] = [];
        let nextLink: string | null = `${graphConfig.graphUsersEndpoint}?$select=id,displayName,mail,userPrincipalName,jobTitle,department&$top=999`;

        while (nextLink) {
          const response = await fetch(nextLink, { headers });
          if (!response.ok) {
            throw new Error("無法取得同仁資料");
          }

          const data: {
            value?: Colleague[];
            "@odata.nextLink"?: string;
          } = await response.json();
          if (Array.isArray(data.value)) {
            for (const item of data.value) {
              users.push(item);
            }
          }

          nextLink = data["@odata.nextLink"] ?? null;
        }

        const uniqueUsersMap = new Map<string, Colleague>();
        users.forEach((user) => {
          if (user.id) {
            uniqueUsersMap.set(user.id, user);
          }
        });

        const sortedUsers = Array.from(uniqueUsersMap.values()).sort((a, b) => {
          const nameA = a.displayName || a.userPrincipalName || "";
          const nameB = b.displayName || b.userPrincipalName || "";
          return nameA.localeCompare(nameB, "zh-Hant-u-co-stroke");
        });

        if (isMounted) {
          setColleagues(sortedUsers);
        }
      } catch (error) {
        console.error("取得同仁資料失敗:", error);
        if (isMounted) {
          setColleaguesError((error as Error).message || "發生錯誤，請稍後再試");
        }
      } finally {
        if (isMounted) {
          setColleaguesLoading(false);
        }
      }
    };

    fetchColleagues();

    return () => {
      isMounted = false;
    };
  }, [accounts, instance]);

  const handleLogout = () => {
    instance.logoutPopup({
      postLogoutRedirectUri: typeof window !== "undefined" ? window.location.origin : "/",
    });
  };

  const initials = useMemo(() => {
    const name = profile?.displayName || profile?.userPrincipalName || "";
    if (!name) {
      return "?";
    }

    const cleaned = name.trim().replace(/\s+/g, " ");
    const parts = cleaned.split(" ");
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return (parts[0][0] + parts[1][0]).toUpperCase();
  }, [profile?.displayName, profile?.userPrincipalName]);

  const activeColleagueId = userId ?? profile?.id ?? null;
  const isViewingSelf = !userId || (!!myProfileId && userId === myProfileId);

  return (
    <div className="container">
      <div className="profile-layout">
        <div className="card profile-card">
          {profileLoading ? (
            <div className="loading">載入個人資訊中...</div>
          ) : profileError ? (
            <div className="error">{profileError}</div>
          ) : profile ? (
            <>
              <div className="profile-header">
                <div className="profile-avatar">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={`${profile.displayName ?? "使用者"} 的頭像`} />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                <div className="profile-summary">
                  <h1>{profile.displayName || "未命名使用者"}</h1>
                  <p className="profile-field">
                    <span className="profile-label">中文姓名：</span>
                    <span>{profile.displayName || "無"}</span>
                  </p>
                  <p className="profile-field">
                    <span className="profile-label">登入帳號：</span>
                    <span>{profile.userPrincipalName || "無"}</span>
                  </p>
                  <p className="profile-field">
                    <span className="profile-label">電子郵件：</span>
                    <span>{profile.mail || profile.userPrincipalName || "無"}</span>
                  </p>
                  {profile.jobTitle && (
                    <p className="profile-field">
                      <span className="profile-label">職稱：</span>
                      <span>{profile.jobTitle}</span>
                    </p>
                  )}
                  {profile.department && (
                    <p className="profile-field">
                      <span className="profile-label">部門：</span>
                      <span>{profile.department}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="profile-actions">
                {!isViewingSelf && (
                  <button className="button button-secondary" onClick={() => router.push("/profile")}
                  >
                    返回我的資料
                  </button>
                )}
                <button className="button button-secondary" onClick={handleLogout}>
                  登出
                </button>
              </div>
            </>
          ) : (
            <div className="error">尚未取得個人資料</div>
          )}
        </div>

        <div className="card colleagues-card">
          <div className="colleagues-header">
            <h2>公司同仁</h2>
            <p>點擊以查看同仁的基本資料</p>
          </div>

          {colleaguesLoading ? (
            <div className="loading">載入同仁資料中...</div>
          ) : colleaguesError ? (
            <div className="error">{colleaguesError}</div>
          ) : (
            <div className="colleagues-list">
              <Link
                href="/profile"
                className={`colleague-item ${!userId ? "active" : ""}`}
              >
                <div className="colleague-name">我的資料</div>
                <div className="colleague-email">{myProfile?.mail || myProfile?.userPrincipalName || (profileLoading ? "載入中..." : "")}</div>
              </Link>
              {colleaguesToDisplay.map((colleague) => {
                const name = colleague.displayName || colleague.userPrincipalName || "未命名";
                const email = colleague.mail || colleague.userPrincipalName || "無";
                const isActive = activeColleagueId === colleague.id;

                return (
                  <Link
                    key={colleague.id}
                    href={`/profile?userId=${encodeURIComponent(colleague.id)}`}
                    className={`colleague-item ${isActive ? "active" : ""}`}
                  >
                    <div className="colleague-name">{name}</div>
                    <div className="colleague-email">{email}</div>
                    {colleague.jobTitle && (
                      <div className="colleague-meta">{colleague.jobTitle}</div>
                    )}
                    {colleague.department && (
                      <div className="colleague-meta">{colleague.department}</div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

