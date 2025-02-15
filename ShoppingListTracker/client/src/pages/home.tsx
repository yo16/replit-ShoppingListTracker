import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ShoppingItem, DEFAULT_ITEMS, WebhookPayload } from "@shared/schema";
import { ShoppingCart, Plus, Send, Lock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import Cookies from 'js-cookie';

export default function Home() {
  const [items, setItems] = useState<ShoppingItem[]>(DEFAULT_ITEMS);
  const [newItem, setNewItem] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  // クッキーからパスワードを読み込む
  useEffect(() => {
    const savedPassword = Cookies.get('password');
    if (savedPassword) {
      setPassword(savedPassword);
    }
  }, []);

  const handleAddItem = () => {
    if (!newItem.trim()) return;

    const newShoppingItem: ShoppingItem = {
      id: crypto.randomUUID(),
      name: newItem.trim(),
      isSelected: false,
    };

    setItems([...items, newShoppingItem]);
    setNewItem("");
  };

  const handleItemCheck = (itemId: string) => {
    setItems(items.map(item =>
      item.id === itemId ? { ...item, isSelected: !item.isSelected } : item
    ));
  };

  const handleSubmit = async () => {
    const selectedItems = items.filter(item => item.isSelected).map(item => item.name);

    if (selectedItems.length === 0) {
      toast({
        title: "エラー",
        description: "アイテムを選択してください",
        variant: "destructive"
      });
      return;
    }

    if (!password) {
      toast({
        title: "エラー",
        description: "パスワードを入力してください",
        variant: "destructive"
      });
      return;
    }

    const payload: WebhookPayload = {
      items: selectedItems,
      password: password
    };

    setIsSubmitting(true);
    try {
      await apiRequest('POST', '/api/webhook', payload);
      // パスワードをクッキーに保存（30日間有効）
      Cookies.set('password', password, { expires: 30 });
      toast({
        title: "成功",
        description: "送信完了",
      });
      // Reset selections
      setItems(items.map(item => ({ ...item, isSelected: false })));
    } catch (error) {
      console.error('Error sending webhook:', error);
      let errorMessage = "送信に失敗しました";
      if (error instanceof Error && error.message.includes("401")) {
        errorMessage = "パスワードが正しくありません";
      }
      toast({
        title: "エラー",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl min-h-screen">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            買い物リスト
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Input
              placeholder="新しいアイテムを追加"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
            />
            <Button onClick={handleAddItem} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center space-x-2">
                <Checkbox
                  id={item.id}
                  checked={item.isSelected}
                  onCheckedChange={() => handleItemCheck(item.id)}
                />
                <label
                  htmlFor={item.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {item.name}
                </label>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="管理者パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? "送信中..." : "確定"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}