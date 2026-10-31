import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { getStatus, injectItems } from '../pocketPoke'

export default function HomePage() {
  const [appVersion, setAppVersion] = React.useState<string | null>(null)
  const [versionError, setVersionError] = React.useState<string | null>(null)
  const [switchStatus, setSwitchStatus] = React.useState<string | null>(null)
  const [switchStatusError, setSwitchStatusError] = React.useState<string | null>(null)
  const [isCheckingSwitchStatus, setIsCheckingSwitchStatus] = React.useState(false)
  const conn = {ip: "192.168.12.115"}; // port defaults to 6000, timeout to 3s

  async function getSwitchStatus() {
    setIsCheckingSwitchStatus(true)
    setSwitchStatus(null)
    setSwitchStatusError(null)
    try {
      const status = await getStatus(conn)
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
      <div className="grid grid-col-1 text-2xl w-full text-center">
        <div>
          <Image
            className="ml-auto mr-auto"
            src="/images/logo.png"
            alt="Logo image"
            width={256}
            height={256}
          />
        </div>
        <span>⚡ Electron ⚡</span>
        <span>+</span>
        <span>Next.js</span>
        <span>+</span>
        <span>tailwindcss</span>
        <span>=</span>
        <span>💕 </span>
      </div>
      <div className="mt-1 w-full flex-wrap flex justify-center">
        <Link href="/next">Go to next page</Link>
      </div>
      <div>
        <button type="button" onClick={getSwitchStatus} disabled={isCheckingSwitchStatus}>
          {isCheckingSwitchStatus ? 'Checking Switch…' : 'Get Switch Status'}
        </button>
        {switchStatus && <p>{switchStatus}</p>}
        {switchStatusError && <p role="alert">{switchStatusError}</p>}
      </div>
      <button type="button" onClick={InjectTestItem}>Inject Test Item</button>
      <div className="mt-4 w-full text-center">
        <button type="button" onClick={loadAppVersion}>
          Get app version from Electron
        </button>
        {appVersion && <p>Electron app version: {appVersion}</p>}
        {versionError && <p role="alert">{versionError}</p>}
      </div>
    </React.Fragment>
  )
}
