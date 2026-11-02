import React from 'react'
import Head from 'next/head'
import AppHeader from '@/components/AppHeader'
import AppInventoryEditor from '#components/AppInventoryEditor'

export default function HomePage() {
  return (
    <React.Fragment>
      <Head>
        <title>ACNH Pocket Poke v2.0.0 (ACNH 3.0.3) Compatible</title>
      </Head>
      <main>
        <AppHeader/>
        <AppInventoryEditor/>
      </main>
    </React.Fragment>
  )
}
