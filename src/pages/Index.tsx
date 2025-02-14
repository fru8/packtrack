
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { MinusIcon, PlusIcon, RefreshCwIcon } from "lucide-react";

interface DataRow {
  [key: string]: string;
}

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRzhT3ACLoKbVHzGpaslY_l4cBCUqNf5kUh6QRlACgIFsQtBTHiiQya7eAt28DGselPyGxBd7NWY85G/pub?output=csv";
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCoVTQrWmFgHBE2LiebXtHJK3NwW-wirbkduFlYqQf1-RrC_9KTWi8LqAi4iZuKNwzXA/exec";

const Index = () => {
  const { toast } = useToast();
  const [localData, setLocalData] = useState<DataRow[]>([]);
  
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["csvData"],
    queryFn: async () => {
      const response = await axios.get(CSV_URL);
      const rows = response.data
        .split("\n")
        .map((row: string) => {
          const values = row.split(",");
          return {
            name: values[0],
            value: values[1]?.trim() || "0",
          };
        });
      setLocalData(rows);
      return rows;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ index, value }: { index: number, value: string }) => {
      // Use URLSearchParams for the request
      const params = new URLSearchParams();
      params.append('index', String(index + 1)); // Add 1 because spreadsheet rows are 1-based
      params.append('value', value);

      const response = await axios({
        method: 'post',
        url: `${APPS_SCRIPT_URL}?${params.toString()}`,
        // Using no-cors mode and minimal headers
        headers: {
          'Accept': 'application/json',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Value updated in the spreadsheet",
      });
      // Refresh data after successful update
      refetch();
    },
    onError: (error) => {
      console.error('Update error:', error);
      toast({
        title: "Error",
        description: "Failed to update the spreadsheet",
        variant: "destructive",
      });
      // Refresh data to ensure we're in sync
      refetch();
    },
  });

  const handleIncrement = async (index: number, amount: number) => {
    const newValue = parseInt(localData[index].value) + amount;
    
    // Update local state immediately for responsiveness
    setLocalData((prev) => {
      const newData = [...prev];
      newData[index] = {
        ...newData[index],
        value: String(newValue),
      };
      return newData;
    });

    // Send update to Google Sheet
    updateMutation.mutate({
      index,
      value: String(newValue),
    });
  };

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">Unable to load data</h2>
          <p className="text-gray-600">Please try again later</p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCwIcon className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-gray-900">Data Manager</h1>
          <p className="text-gray-600">Update values using the buttons below</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Name</TableHead>
                <TableHead>Value</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-[250px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-[120px] ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                localData.map((row, index) => (
                  <TableRow key={index} className="group">
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>{row.value}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleIncrement(index, -1)}
                          disabled={updateMutation.isPending}
                        >
                          <MinusIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleIncrement(index, 1)}
                          disabled={updateMutation.isPending}
                        >
                          <PlusIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Changes are automatically saved to the spreadsheet</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
