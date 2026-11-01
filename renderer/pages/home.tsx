import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { getSwitchStatus, injectItems } from '../pocketPoke'
import AppHeader from '@/components/AppHeader'
import AppInventoryEditor from '#components/AppInventoryEditor'

export default function HomePage() {
  const [appVersion, setAppVersion] = React.useState<string | null>(null)
  const [versionError, setVersionError] = React.useState<string | null>(null)
  const [switchStatus, setSwitchStatus] = React.useState<string | null>(null)
  const [switchStatusError, setSwitchStatusError] = React.useState<string | null>(null)
  const [isCheckingSwitchStatus, setIsCheckingSwitchStatus] = React.useState(false)
  const conn = {ip: "192.168.12.115"}; // port defaults to 6000, timeout to 3s

  async function getStatus() {
    setIsCheckingSwitchStatus(true)
    setSwitchStatus(null)
    setSwitchStatusError(null)
    try {
      const status = await getSwitchStatus(conn)
      if (!status.reachable) {
        setSwitchStatusError(status.error ?? 'Unable to reach the Switch')
      } else if (!status.acnh_running) {
        setSwitchStatus("Switch is reachable, but ACNH isn't running")
      } else {
        setSwitchStatus('Switch is reachable and ACNH is running')
      }
    } catch (error) {
      setSwitchStatusError(
        error instanceof Error ? error.message : 'Unable to get Switch status',
      )
    } finally {
      setIsCheckingSwitchStatus(false)
    }
  }

  async function InjectTestItem()
  {
    try
    {
      await injectItems({ip: conn.ip}, ["0x03A9"]);
    }
    catch(e)
    {
      console.error("Something went wrong", e);
    }
  }
  const loadAppVersion = async () => {
    try {
      setVersionError(null)
      setAppVersion(await window.ipc.getAppVersion())
    } catch (error) {
      setVersionError(
        error instanceof Error ? error.message : 'Unable to get app version',
      )
    }
  }

  return (
    <React.Fragment>
      <Head>
        <title>ACNH Pocket Poke</title>
      </Head>
      <main>
        <AppHeader/>
        <AppInventoryEditor/>
      </main>
    </React.Fragment>
  )
}
