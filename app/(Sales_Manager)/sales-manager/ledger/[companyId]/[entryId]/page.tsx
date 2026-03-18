import { notFound } from "next/navigation";
import { ledgerCompanies } from "../../data/ledgerData";
import LedgerInvoiceView from "../../components/LedgerInvoiceView";

type Props = {
  params: Promise<{
    companyId: string;
    entryId: string;
  }>;
};

export default async function LedgerInvoicePage({ params }: Props) {
  const { companyId, entryId } = await params;

  const company = ledgerCompanies.find((item) => item.id === companyId);
  if (!company) return notFound();

  const entry = company.entries.find((item) => item.id === entryId);
  if (!entry) return notFound();

  return (
    <div className="min-h-screen bg-[#F3F5F8] px-5 py-5">
      <div className="mx-auto w-full max-w-[1508px]">
        <LedgerInvoiceView entry={entry} />
      </div>
    </div>
  );
}