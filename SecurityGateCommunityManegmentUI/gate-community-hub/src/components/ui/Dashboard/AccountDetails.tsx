import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "../Button";
import { MdEdit } from "react-icons/md";
import { Skeleton } from "../skeleton";
export function AccountDetails() {
  // Replace with real user data
  const user = {
    name: "John Doe",
    unit: "A-123",
    email: "john.doe@example.com",
    phone: "(555) 123-4567",
    since: "January 15, 2022",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <h3 className="font-semibold text-lg">Account Details</h3>
        <Button size="sm" variant="ghost" className="flex items-center">
           <MdEdit className="mr-2" />         
          Edit
        </Button>
      </CardHeader>
            <div className="border-b border-muted -mt-2" />

      <CardContent>
        <div className="grid grid-cols-2 gap-y-4 text-sm">
          <div className="font-medium text-right flex items-center justify-between ">Name:</div>
          <div className="text-right">{user.name}</div>
          <div className="font-medium text-right flex items-center justify-between ">Unit Number:</div>
          <div className="text-right">{user.unit}</div>
          <div className="font-medium text-right flex items-center justify-between ">Email:</div>
          <div className="text-right">{user.email}</div>
          <div className="font-medium text-right flex items-center justify-between ">Phone:</div>
          <div className="text-right">{user.phone}</div>
          <div className="font-medium text-right flex items-center justify-between ">Resident Since:</div>
          <div className="text-right">{user.since}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AccountDetailsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-24" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
