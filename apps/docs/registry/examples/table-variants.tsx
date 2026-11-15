import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const items = [
  { name: "Alvin", item: "Eclair", price: "$0.87" },
  { name: "Alan", item: "Jellybean", price: "$3.76" },
  { name: "Jonathan", item: "Lollipop", price: "$7.00" },
  { name: "Shannon", item: "KitKat", price: "$9.99" },
];

function DemoRows() {
  return (
    <>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Item Name</TableHead>
          <TableHead>Item Price</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((row) => (
          <TableRow key={row.name}>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.item}</TableCell>
            <TableCell>{row.price}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </>
  );
}

export function TableVariants() {
  return (
    <div className="grid w-full gap-10">
      <section>
        <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">Striped</h3>
        <Table striped>
          <DemoRows />
        </Table>
      </section>
      <section>
        <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">Highlight</h3>
        <Table highlight>
          <DemoRows />
        </Table>
      </section>
      <section>
        <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">Centered</h3>
        <Table centered>
          <DemoRows />
        </Table>
      </section>
    </div>
  );
}
