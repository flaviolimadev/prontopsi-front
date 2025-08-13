import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ProntuarioPDFProps {
  paciente: {
    nome: string;
    cpf: string;
    endereco: string;
    nascimento: string;
    profissao: string;
    telefone: string;
    email: string;
  };
  evolucao: Array<{
    data: string;
    registro: string;
  }>;
  avaliacaoDemanda: string;
  encaminhamento: string;
  anexos: string;
}

export const generateProntuarioPDF = async (props: ProntuarioPDFProps) => {
  const { paciente, evolucao, avaliacaoDemanda, encaminhamento, anexos } = props;
  
  // Criar elemento HTML temporário
  const element = document.createElement('div');
  element.style.width = '210mm';
  element.style.padding = '20mm';
  element.style.fontFamily = 'Arial, sans-serif';
  element.style.fontSize = '12px';
  element.style.lineHeight = '1.5';
  element.style.backgroundColor = 'white';
  element.style.color = 'black';
  element.style.position = 'absolute';
  element.style.left = '-9999px';
  element.style.top = '0';
  
  element.innerHTML = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">Prontuário Psicológico</h1>
    </div>

    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 14px; font-weight: bold; margin-bottom: 15px; border-bottom: 1px solid #000; padding-bottom: 5px;">
        Dados do Paciente
      </h2>
      <div style="margin-left: 20px;">
        <p><strong>Nome:</strong> ${paciente.nome || 'Não informado'}</p>
        <p><strong>CPF:</strong> ${paciente.cpf || 'Não informado'}</p>
        <p><strong>Endereço:</strong> ${paciente.endereco || 'Não informado'}</p>
        <p><strong>Data de nascimento:</strong> ${paciente.nascimento || 'Não informado'}</p>
        <p><strong>Profissão:</strong> ${paciente.profissao || 'Não informado'}</p>
        <p><strong>Telefone de contato:</strong> ${paciente.telefone || 'Não informado'}</p>
        <p><strong>E-mail:</strong> ${paciente.email || 'Não informado'}</p>
      </div>
    </div>

    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 14px; font-weight: bold; margin-bottom: 15px; border-bottom: 1px solid #000; padding-bottom: 5px;">
        Avaliação da Demanda e Definição dos Objetivos do Trabalho
      </h2>
      <div style="margin-left: 20px; text-align: justify;">
        <p>${avaliacaoDemanda || ''}</p>
      </div>
    </div>

    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 14px; font-weight: bold; margin-bottom: 15px; border-bottom: 1px solid #000; padding-bottom: 5px;">
        Evolução
      </h2>
      <div style="margin-left: 20px;">
        ${evolucao.length > 0 ? evolucao.map(sessao => `
          <div style="margin-bottom: 20px;">
            <p><strong>Data: ${sessao.data}</strong></p>
            <p style="text-align: justify; margin-left: 20px;">${sessao.registro}</p>
          </div>
        `).join('') : ''}
      </div>
    </div>

    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 14px; font-weight: bold; margin-bottom: 15px; border-bottom: 1px solid #000; padding-bottom: 5px;">
        Encaminhamento e/ou Encerramento
      </h2>
      <div style="margin-left: 20px; text-align: justify;">
        <p>${encaminhamento || ''}</p>
      </div>
    </div>

    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 14px; font-weight: bold; margin-bottom: 15px; border-bottom: 1px solid #000; padding-bottom: 5px;">
        Anexos
      </h2>
      <div style="margin-left: 20px; text-align: justify;">
        <p>${anexos || ''}</p>
      </div>
    </div>
  `;

  document.body.appendChild(element);

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Gerar nome do arquivo
    const dataAtual = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    const nomeArquivo = `Prontuario_${paciente.nome.replace(/\s+/g, '_')}_${dataAtual}.pdf`;
    
    pdf.save(nomeArquivo);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw new Error('Erro ao gerar o PDF do prontuário');
  } finally {
    document.body.removeChild(element);
  }
};
