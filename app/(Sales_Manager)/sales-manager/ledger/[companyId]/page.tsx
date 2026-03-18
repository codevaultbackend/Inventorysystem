import { notFound } from "next/navigation";
import { ledgerCompanies } from "../data/ledgerData";
import LedgerEntriesTable from "../components/LedgerEntriesTable";

type Props = {
  params: Promise<{
    companyId: string;
  }>;
};

export default async function CompanyLedgerEntriesPage({ params }: Props) {
  const { companyId } = await params;

  const company = ledgerCompanies.find((item) => item.id === companyId);

  if (!company) return notFound();

  return (
    <div className="min-h-screen bg-[#F6F8FB] p-4 sm:p-6">
      <div className="mx-auto max-w-[1400px] rounded-[24px] bg-[#F8FAFC] p-4 shadow-[0_20px_50px_rgba(15,23,42,0.06)] sm:p-6">
        <LedgerEntriesTable company={company} />
      </div>
    </div>
  );
}