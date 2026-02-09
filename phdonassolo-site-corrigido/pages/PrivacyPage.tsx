import React from 'react';

const PrivacyPage = () => {
  return (
    <main className="pt-32 pb-20 px-6 bg-white min-h-screen">
      <div className="max-w-3xl mx-auto prose prose-slate">
        <h1 className="text-5xl font-bold tracking-tight mb-8">Política de Privacidade</h1>
        <p className="text-gray-500 font-medium mb-12 italic text-lg">Última atualização: Março de 2024</p>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">1. Introdução</h2>
          <p>Esta Política de Privacidade descreve como o site <strong>PH Donassolo</strong> coleta, utiliza e protege suas informações. Ao utilizar nosso site, você concorda com as práticas descritas aqui.</p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">2. Coleta de Dados</h2>
          <p>Coletamos informações que você nos fornece voluntariamente, como:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Nome e e-mail via formulários de contato ou newsletter.</li>
            <li>Informações enviadas através de interações com nosso Assistente Digital.</li>
            <li>Dados de navegação anônimos (cookies) para melhorar a experiência do usuário via Google Analytics.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">3. Uso das Informações</h2>
          <p>Os dados coletados são utilizados para:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Fornecer suporte e responder a dúvidas sobre cursos e consultoria.</li>
            <li>Enviar atualizações sobre novos conteúdos (caso inscrito na newsletter).</li>
            <li>Personalizar a experiência do aluno em nossa futura área restrita.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">4. Segurança</h2>
          <p>Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados pessoais contra acesso não autorizado ou perda.</p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">5. Seus Direitos</h2>
          <p>Conforme a LGPD, você tem o direito de acessar, corrigir ou solicitar a exclusão de seus dados pessoais a qualquer momento através do e-mail <strong>paulo@phdonassolo.com</strong>.</p>
        </section>

        <div className="mt-20 p-8 bg-gray-50 rounded-[32px] border border-gray-100">
          <p className="text-sm text-gray-500 leading-relaxed m-0">
            Esta política pode ser atualizada periodicamente. Recomendamos a revisão desta página regularmente para se manter informado sobre como protegemos seus dados.
          </p>
        </div>
        
        <div className="mt-8">
          <a href="#/" className="text-blue-600 font-bold hover:underline inline-flex items-center gap-2">
            ← Voltar para o início
          </a>
        </div>
      </div>
    </main>
  );
};

export default PrivacyPage;