import Link from 'next/link';

export default function Home() {
  return (
    <main className="main-container">
      <h1>REPORTES</h1>

      <div className="grid-reportes">
        <Link href="/reports/1" className="cuadro color-1">1</Link>
        <Link href="/reports/2" className="cuadro color-2">2</Link>
        <Link href="/reports/3" className="cuadro color-3">3</Link>
        
        <div style={{width: '100%', height: 0}}></div> 

        <Link href="/reports/4" className="cuadro color-4">4</Link>
        <Link href="/reports/5" className="cuadro color-5">5</Link>
      </div>
    </main>
  );
}