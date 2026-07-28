"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Container from "@components/v2/layout/Container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Package, Pencil, Lock, User, Mail, Phone, MapPin, ShieldCheck, Wallet, AlertCircle } from "lucide-react";
import { customerInfoService } from "@/services/customer-info.service";
import { getErrorMessage } from "@/lib/apiError";
import { useTranslation } from "@/Context/LanguageContext";
import { useAuth } from "@/Context/AuthContext";
import type { CustomerInfoResponse } from "@/services/customer-info.service";

export default function AccountPage() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [customer, setCustomer] = useState<CustomerInfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Name & email editor state
  const [editingName, setEditingName] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [nameSaving, setNameSaving] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Detect synthetic placeholder emails — phone-based (+xxx@obd.ma) or the legacy noemail_ format
  const isSyntheticEmail = (email?: string) =>
    !!email &&
    email.endsWith("@obd.ma") &&
    (email.startsWith("+") || email.startsWith("noemail_"));

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    customerInfoService
      .getCustomerInfo()
      .then((res) => {
        const info = res.data.customer_info;
        setCustomer(info);
        setFirstName(info.firstName || "");
        setLastName(info.lastName || "");
        setEmail(isSyntheticEmail(info.email) ? "" : info.email || "");
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [authLoading, isAuthenticated]);

  const isNormalAccount = customer?.accountType === "NORMAL";
  const isGoogleAccount = customer?.accountType === "GOOGLE";

  const showSuccess = (key: string) => {
    setSuccessMsg(t(key));
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleSaveName = async () => {
    if (!customer) return;
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedEmail = email.trim();
    if (trimmedFirst.length < 2 || trimmedLast.length < 2) return;

    setNameSaving(true);
    setError(null);
    try {
      const updatePayload: { firstName: string; lastName: string; email?: string } = {
        firstName: trimmedFirst,
        lastName: trimmedLast,
      };
      if (trimmedEmail && trimmedEmail !== (isSyntheticEmail(customer.email) ? "" : customer.email)) {
        updatePayload.email = trimmedEmail;
      }
      await customerInfoService.updateCustomerInfo(updatePayload);
      setCustomer({
        ...customer,
        firstName: trimmedFirst,
        lastName: trimmedLast,
        ...(updatePayload.email ? { email: updatePayload.email } : {}),
      });
      setEditingName(false);
      showSuccess("account.name_updated");
    } catch (err) {
      setError(err);
    } finally {
      setNameSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!customer || !isNormalAccount) return;
    if (newPassword.length < 6) return;
    if (newPassword !== confirmPassword) return;

    setPasswordSaving(true);
    setError(null);
    try {
      await customerInfoService.updateCustomerInfo({
        password: newPassword,
        confirmPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
      showSuccess("account.password_changed");
    } catch (err) {
      setError(err);
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <section className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/30 dark:from-[#020617] dark:to-[#05070a]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(39,140,217,0.06),_transparent_50%)] dark:bg-[radial-gradient(circle_at_top_right,_rgba(39,140,217,0.12),_transparent_50%)]" />
      </div>

      <Container className="relative z-10 flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
        <div className="w-full max-w-2xl rounded-2xl border border-border bg-card/95 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0B1120]/90 sm:p-8">
          <h2 className="mb-1 text-2xl font-bold sm:text-3xl">
            {t("account.title")}
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
            </div>
          ) : !customer ? (
            <>
              <p className="mb-6 text-sm text-muted-foreground">
                {t("account.login_message")}
              </p>
              <Link href="/login?redirect=/account" className="block">
                <Button className="w-full bg-brand-blue text-white hover:bg-brand-blue/90">
                  {t("auth.sign_in")}
                </Button>
              </Link>
            </>
          ) : (
            <>
              <p className="mb-6 text-sm text-muted-foreground">
                {t("account.account_and_info")}
              </p>

              {/* Financial Balance & Debt */}
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-4 dark:border-white/10 dark:bg-white/5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("account.balance")}</p>
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {(customer.wallet || 0).toFixed(2)} MAD
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-4 dark:border-white/10 dark:bg-white/5">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${(customer.amountDue || 0) > 0 ? "bg-amber-500/10 text-amber-500" : "bg-gray-500/10 text-gray-500"}`}>
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("account.debt")}</p>
                    <p className={`text-lg font-bold ${(customer.amountDue || 0) > 0 ? "text-amber-600 dark:text-amber-400" : "text-foreground"}`}>
                      {(customer.amountDue || 0).toFixed(2)} MAD
                    </p>
                  </div>
                </div>
              </div>

              {/* Login method */}
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-4 dark:border-white/10 dark:bg-white/5">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isGoogleAccount ? "bg-red-500/10 text-red-500" : "bg-brand-blue/10 text-brand-blue"}`}>
                  {isGoogleAccount ? <Mail className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("account.login_method")}</p>
                  <p className="font-semibold text-foreground">
                    {isGoogleAccount ? t("account.login_method_google") : t("account.login_method_normal")}
                  </p>
                </div>
              </div>

              {/* Personal info */}
              <div className="mb-6 rounded-xl border border-border p-4 dark:border-white/10">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold">{t("account.personal_info")}</h3>
                  {!editingName && (
                    <Button variant="ghost" size="sm" onClick={() => setEditingName(true)}>
                      <Pencil className="mr-1 h-4 w-4" />
                      {t("account.edit")}
                    </Button>
                  )}
                </div>

                {editingName ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">{t("personal_info.first_name")}</Label>
                        <Input
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          disabled={nameSaving}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">{t("personal_info.last_name")}</Label>
                        <Input
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          disabled={nameSaving}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t("personal_info.email")}</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder={t("personal_info.enter_email")}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={nameSaving}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSaveName}
                        disabled={nameSaving || firstName.trim().length < 2 || lastName.trim().length < 2}
                      >
                        {nameSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t("account.save")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingName(false);
                          setFirstName(customer.firstName || "");
                          setLastName(customer.lastName || "");
                          setEmail(isSyntheticEmail(customer.email) ? "" : customer.email || "");
                        }}
                        disabled={nameSaving}
                      >
                        {t("account.cancel")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <dl className="grid gap-4 sm:grid-cols-2">
                    <InfoRow icon={<User className="h-4 w-4" />} label={t("personal_info.first_name")} value={customer.firstName} />
                    <InfoRow icon={<User className="h-4 w-4" />} label={t("personal_info.last_name")} value={customer.lastName} />
                    {/* Email — full width, shows placeholder text when synthetic */}
                    <div className="sm:col-span-2">
                      <InfoRow
                        icon={<Mail className="h-4 w-4" />}
                        label={t("personal_info.email")}
                        value={
                          isSyntheticEmail(customer.email)
                            ? t("common.not_available")
                            : customer.email || t("common.not_available")
                        }
                        hint={
                          isSyntheticEmail(customer.email)
                            ? t("registerPage.email_optional_hint")
                            : undefined
                        }
                        action={
                          isSyntheticEmail(customer.email) ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs text-brand-blue border-brand-blue/30 hover:bg-brand-blue/10"
                              onClick={() => setEditingName(true)}
                            >
                              + {t("common.add")} {t("auth.email")}
                            </Button>
                          ) : undefined
                        }
                      />
                    </div>
                    {/* Phone — full width */}
                    <div className="sm:col-span-2">
                      <InfoRow icon={<Phone className="h-4 w-4" />} label={t("personal_info.phone")} value={customer.phoneNumber || t("common.not_available")} />
                    </div>
                    <div className="sm:col-span-2">
                      <InfoRow icon={<MapPin className="h-4 w-4" />} label={t("personal_info.address")} value={`${customer.address || ""}, ${customer.city || ""}`.replace(/^,\s*|,\s*$/g, "") || t("common.not_available")} />
                    </div>
                  </dl>
                )}
              </div>

              {/* Password change (normal accounts only) */}
              {isNormalAccount && (
                <div className="mb-6 rounded-xl border border-border p-4 dark:border-white/10">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="h-5 w-5 text-brand-red" />
                      <h3 className="font-semibold">{t("account.change_password")}</h3>
                    </div>
                    {!showPasswordForm && (
                      <Button variant="outline" size="sm" onClick={() => setShowPasswordForm(true)}>
                        {t("account.change")}
                      </Button>
                    )}
                  </div>

                  {showPasswordForm && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">{t("account.new_password")}</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          disabled={passwordSaving}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">{t("account.confirm_password")}</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          disabled={passwordSaving}
                        />
                      </div>
                      {newPassword && confirmPassword && newPassword !== confirmPassword && (
                        <p className="text-xs text-danger">{t("account.passwords_mismatch")}</p>
                      )}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleChangePassword}
                          disabled={passwordSaving || newPassword.length < 6 || newPassword !== confirmPassword}
                        >
                          {passwordSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {t("account.save")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setShowPasswordForm(false);
                            setNewPassword("");
                            setConfirmPassword("");
                          }}
                          disabled={passwordSaving}
                        >
                          {t("account.cancel")}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Link href="/orders" className="block">
                <Button variant="outline" className="w-full gap-2">
                  <Package className="h-4 w-4" />
                  {t("account.order_history")}
                </Button>
              </Link>
            </>
          )}

          {!!successMsg && (
            <p className="mt-4 rounded-md bg-success/10 p-2 text-sm text-success">{successMsg}</p>
          )}

          {!!error && !loading && (
            <p className="mt-4 rounded-md bg-danger/10 p-2 text-sm text-danger">
              {getErrorMessage(error, t)}
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}

function InfoRow({
  icon,
  label,
  value,
  hint,
  action,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3 min-w-0">
        <div className="mt-0.5 shrink-0 text-muted-foreground">{icon}</div>
        <div className="min-w-0">
          <dt className="text-xs text-muted-foreground">{label}</dt>
          <dd className="break-all font-medium text-foreground">{value}</dd>
          {hint && <p className="mt-0.5 text-xs text-muted-foreground/70">{hint}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
