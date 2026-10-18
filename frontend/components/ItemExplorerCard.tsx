import { useACNHPocketPokeContext } from "@/context/ACNHPocketPokeContext";
import { computeItemHex } from "@/lib/ItemHelper";
import { injectItems } from "@/lib/pocketPoke";
import { ACNHItem } from "@/types/ACNHItem";
import { toast } from "@/components/ui/toast"

export default function ItemExplorerCard({ item }: { item: ACNHItem }) {

    const {switchIP} = useACNHPocketPokeContext();
    async function injectItem(){
        console.log(`Found IP ${switchIP}`)
        if(switchIP === "") return;

        try{
            const hex = computeItemHex(item);
            await injectItems({ip:switchIP},[hex])
            toast.add({
                type: "success",
                description: `Added ${item.Name.toUpperCase()} to inventory slot one.`
            })
        }
        catch(e)
        {
            toast.add({
                type: "error",
                description:"There was an error adding the item to inventory. Is your switch on, connected to WiFi, and running ACNH?"
            })
        }
        
    }
  return (
    <div className="h-full w-ful bg-slate-600  rounded-xl p-2 hover:scale-105 hover:cursor-pointer" onClick={injectItem}>
      {item.Image && (
        <img src={item.Image} alt={item.Name} width={100} height={100} />
      )}
      <p className="text-[14px] font-bold uppercase line-clamp-2 leading-tight text-center">{item.Name}</p>
      <div className="mt-3">
        <p className="text-[12px] font-bold uppercase leading-tight">Housewares</p>
        <p className="text-[12px] font-bold uppercase">ID: {item["Internal ID"]}</p>
        <p className="text-[12px] font-bold uppercase">Hex: {computeItemHex(item)}</p>
      </div>
    </div>
  );
}