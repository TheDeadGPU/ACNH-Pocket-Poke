"use client";

import { useACNHPocketPokeContext } from "@/context/ACNHPocketPokeContext";
import { Button } from "../ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { useState } from "react";

export default function ShoppingCartClearButton() {
    const { clearShoppingCart, shoppingCartItems } = useACNHPocketPokeContext();
    const [isOpen, setIsOpen] = useState(false);

    function handleClearCart()
    {
        clearShoppingCart();
        setIsOpen(false);
    }
    return (

        <AlertDialog open={isOpen}>
            <AlertDialogTrigger render={
                <Button
                    variant="destructive"
                    onClick={() => setIsOpen(true)}
                    disabled={shoppingCartItems.length === 0}
                >
                    Clear Cart
                </Button>} />
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently clear your cart.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setIsOpen(false)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearCart}>Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}