'use client'

import { useMsal } from "@azure/msal-react";
import { loginRequest } from "@/lib/msalConfig";
import { sharePointConfig } from "@/lib/sharePointConfig";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SharePointList {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  webUrl?: string;
}

interface ListField {
  name: string;
  type: string;
  required?: boolean;
  choices?: string[];
}

export default function SharePointAdmin() {
  const { instance, accounts } = useMsal();
  const router = useRouter();

  const [siteId, setSiteId] = useState<string | null>(null);
  const [siteIdLoading, setSiteIdLoading] = useState(false);
  const [siteIdError, setSiteIdError] = useState<string | null>(null);

  const [lists, setLists] = useState<SharePointList[]>([]);
  const [listsLoading, setListsLoading] = useState(false);
  const [listsError, setListsError] = useState<string | null>(null);

  const [creatingList, setCreatingList] = useState(false);
  const [createListError, setCreateListError] = useState<string | null>(null);
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const [siteUrl, setSiteUrl] = useState(sharePointConfig.defaultSiteUrl);

  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [listItems, setListItems] = useState<any[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState<string | null>(null);

  const [addingItem, setAddingItem] = useState(false);
  const [newItemFields, setNewItemFields] = useState<Record<string, string>>({});

  useEffect(() => {
    const activeAccount = instance.getActiveAccount() ?? accounts[0];
    if (!activeAccount) {
      router.push("/");
      return;
    }

    loadSiteId();
  }, [accounts, instance, router]);

  useEffect(() => {
    if (siteId) {
      loadLists();
    }
  }, [siteId]);

  useEffect(() => {
    if (selectedListId && siteId) {
      loadListItems();
    }
  }, [selectedListId, siteId]);

  const loadSiteId = async () => {
    const activeAccount = instance.getActiveAccount() ?? accounts[0];
    if (!activeAccount) return;

    setSiteIdLoading(true);
    setSiteIdError(null);

    try {
      const tokenResponse = await instance.acquireTokenSilent({
        ...loginRequest,
        account: activeAccount,
      });

      const id = await sharePointConfig.getSiteId(tokenResponse.accessToken, siteUrl);
      setSiteId(id);
    } catch (error) {
      console.error("載入網站 ID 失敗:", error);
      const errorMessage = (error as Error).message || "無法載入 SharePoint 網站";
      setSiteIdError(errorMessage);
      
      // 顯示更詳細的錯誤資訊
      console.error("詳細錯誤資訊:", {
        siteUrl,
        error: errorMessage,
      });
    } finally {
      setSiteIdLoading(false);
    }
  };

  const loadLists = async () => {
    if (!siteId) return;

    const activeAccount = instance.getActiveAccount() ?? accounts[0];
    if (!activeAccount) return;

    setListsLoading(true);
    setListsError(null);

    try {
      const tokenResponse = await instance.acquireTokenSilent({
        ...loginRequest,
        account: activeAccount,
      });

      const response = await fetch(
        `https://graph.microsoft.com/v1.0/sites/${siteId}/lists`,
        {
          headers: {
            Authorization: `Bearer ${tokenResponse.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("無法載入清單");
      }

      const data = await response.json();
      setLists(data.value || []);
    } catch (error) {
      console.error("載入清單失敗:", error);
      setListsError((error as Error).message || "無法載入清單");
    } finally {
      setListsLoading(false);
    }
  };

  const handleCreateList = async () => {
    if (!siteId || !newListName.trim()) {
      alert("請輸入清單名稱");
      return;
    }

    const activeAccount = instance.getActiveAccount() ?? accounts[0];
    if (!activeAccount) return;

    setCreatingList(true);
    setCreateListError(null);

    try {
      const tokenResponse = await instance.acquireTokenSilent({
        ...loginRequest,
        account: activeAccount,
      });

      const response = await fetch(
        `https://graph.microsoft.com/v1.0/sites/${siteId}/lists`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokenResponse.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            displayName: newListName,
            description: newListDescription || undefined,
            template: "genericList", // 通用清單模板
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "無法建立清單");
      }

      const newList = await response.json();
      setLists([...lists, newList]);
      setNewListName("");
      setNewListDescription("");
      alert("清單建立成功！");
    } catch (error) {
      console.error("建立清單失敗:", error);
      setCreateListError((error as Error).message || "無法建立清單");
      alert(`建立清單失敗：${(error as Error).message}`);
    } finally {
      setCreatingList(false);
    }
  };

  const loadListItems = async () => {
    if (!siteId || !selectedListId) return;

    const activeAccount = instance.getActiveAccount() ?? accounts[0];
    if (!activeAccount) return;

    setItemsLoading(true);
    setItemsError(null);

    try {
      const tokenResponse = await instance.acquireTokenSilent({
        ...loginRequest,
        account: activeAccount,
      });

      // 先取得清單的欄位資訊
      const listResponse = await fetch(
        `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${selectedListId}`,
        {
          headers: {
            Authorization: `Bearer ${tokenResponse.accessToken}`,
          },
        }
      );

      if (!listResponse.ok) {
        throw new Error("無法載入清單資訊");
      }

      const listData = await listResponse.json();

      // 取得清單項目
      const itemsResponse = await fetch(
        `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${selectedListId}/items?$expand=fields`,
        {
          headers: {
            Authorization: `Bearer ${tokenResponse.accessToken}`,
          },
        }
      );

      if (!itemsResponse.ok) {
        throw new Error("無法載入清單項目");
      }

      const itemsData = await itemsResponse.json();
      setListItems(itemsData.value || []);
    } catch (error) {
      console.error("載入清單項目失敗:", error);
      setItemsError((error as Error).message || "無法載入清單項目");
    } finally {
      setItemsLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!siteId || !selectedListId) {
      alert("請先選擇一個清單");
      return;
    }

    const activeAccount = instance.getActiveAccount() ?? accounts[0];
    if (!activeAccount) return;

    setAddingItem(true);

    try {
      const tokenResponse = await instance.acquireTokenSilent({
        ...loginRequest,
        account: activeAccount,
      });

      // 準備欄位資料
      const fields: Record<string, any> = {};
      Object.entries(newItemFields).forEach(([key, value]) => {
        if (value.trim()) {
          fields[key] = value;
        }
      });

      const response = await fetch(
        `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${selectedListId}/items`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokenResponse.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fields,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "無法新增項目");
      }

      const newItem = await response.json();
      setListItems([...listItems, newItem]);
      setNewItemFields({});
      alert("項目新增成功！");
    } catch (error) {
      console.error("新增項目失敗:", error);
      alert(`新增項目失敗：${(error as Error).message}`);
    } finally {
      setAddingItem(false);
    }
  };

  return (
    <div className="container">
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>SharePoint List 管理</h1>
        <Link href="/profile" className="button button-secondary" style={{ textDecoration: "none", display: "inline-block" }}>
          返回個人頁面
        </Link>
      </div>

      {siteIdLoading ? (
        <div className="card">
          <div className="loading">載入 SharePoint 網站中...</div>
        </div>
      ) : siteIdError ? (
        <div className="card">
          <div className="error">{siteIdError}</div>
          <p style={{ marginTop: "1rem" }}>
            請確認您已在 Azure 入口網站中授與 <strong>Sites.ReadWrite.All</strong> 權限
          </p>
        </div>
      ) : (
        <>
          {/* 網站資訊 */}
          <div className="card" style={{ marginBottom: "1.5rem", background: "#f0f9ff", border: "1px solid #bae6fd" }}>
            <h3 style={{ marginBottom: "0.5rem" }}>目前使用的 SharePoint 網站</h3>
            <p style={{ margin: 0, color: "#0369a1", wordBreak: "break-all" }}>
              {siteUrl}
            </p>
            <p style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#64748b" }}>
              💡 <strong>權限說明：</strong>在此網站建立的清單，預設所有群組成員都可以看到。
              如需設定權限（例如：只有申請人和會計可以看到請款單），請在建立清單後，前往 SharePoint 網站手動設定權限。
            </p>
          </div>

          {/* 建立新清單 */}
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ marginBottom: "1rem" }}>建立新清單</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                  清單名稱 *
                </label>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="例如：請款單、員工資料"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "1rem",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                  說明（選填）
                </label>
                <textarea
                  value={newListDescription}
                  onChange={(e) => setNewListDescription(e.target.value)}
                  placeholder="清單的用途說明"
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "1rem",
                    fontFamily: "inherit",
                  }}
                />
              </div>
              <button
                className="button"
                onClick={handleCreateList}
                disabled={creatingList || !newListName.trim()}
              >
                {creatingList ? "建立中..." : "建立清單"}
              </button>
              {createListError && (
                <div className="error">{createListError}</div>
              )}
            </div>
          </div>

          {/* 現有清單 */}
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ marginBottom: "1rem" }}>現有清單</h2>
            {listsLoading ? (
              <div className="loading">載入清單中...</div>
            ) : listsError ? (
              <div className="error">{listsError}</div>
            ) : lists.length === 0 ? (
              <p>尚無清單，請先建立一個清單</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {lists.map((list) => (
                  <button
                    key={list.id}
                    onClick={() => setSelectedListId(list.id)}
                    className={`colleague-item ${selectedListId === list.id ? "active" : ""}`}
                    style={{
                      textAlign: "left",
                      cursor: "pointer",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      padding: "1rem",
                      background: selectedListId === list.id ? "#eff6ff" : "white",
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                      {list.displayName || list.name}
                    </div>
                    {list.description && (
                      <div style={{ fontSize: "0.9rem", color: "#6b7280" }}>
                        {list.description}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 清單項目 */}
          {selectedListId && (
            <div className="card">
              <h2 style={{ marginBottom: "1rem" }}>
                清單項目：{lists.find((l) => l.id === selectedListId)?.displayName}
              </h2>

              {itemsLoading ? (
                <div className="loading">載入項目中...</div>
              ) : itemsError ? (
                <div className="error">{itemsError}</div>
              ) : (
                <>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <h3 style={{ marginBottom: "1rem" }}>新增項目</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                          標題 *
                        </label>
                        <input
                          type="text"
                          value={newItemFields.Title || ""}
                          onChange={(e) =>
                            setNewItemFields({ ...newItemFields, Title: e.target.value })
                          }
                          placeholder="項目標題"
                          style={{
                            width: "100%",
                            padding: "0.75rem",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            fontSize: "1rem",
                          }}
                        />
                      </div>
                      <button
                        className="button"
                        onClick={handleAddItem}
                        disabled={addingItem || !newItemFields.Title?.trim()}
                      >
                        {addingItem ? "新增中..." : "新增項目"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 style={{ marginBottom: "1rem" }}>現有項目</h3>
                    {listItems.length === 0 ? (
                      <p>尚無項目</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {listItems.map((item) => (
                          <div
                            key={item.id}
                            style={{
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px",
                            padding: "1rem",
                              background: "#f9fafb",
                            }}
                          >
                            <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
                              {item.fields?.Title || "無標題"}
                            </div>
                            <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                              ID: {item.id}
                            </div>
                            {item.fields && (
                              <div style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>
                                {Object.entries(item.fields)
                                  .filter(([key]) => !key.startsWith("@") && key !== "Title")
                                  .map(([key, value]) => (
                                    <div key={key} style={{ marginTop: "0.25rem" }}>
                                      <strong>{key}:</strong> {String(value || "無")}
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

