import Head from 'next/head';
import styles from '../styles/Home.module.scss'

import { database } from '../services/firebase';
import { useEffect, useState } from 'react';

type Contato ={
  chave: string
  nome: string
  email: string
  telefone: string
  observacao: string
}
export default function Home() {

  const [nome, setNome]= useState('')
  const [email, setEmail]= useState('')
  const [telefone, setTelefone]= useState('')
  const [observacao, setObservacao]= useState('')

  const[constatos, setConstatos]= useState<Contato[]>()

  const [busca, setBusca] =useState<Contato[]>()

  const[estaBuscando, setEstaBuscando]= useState(false)

  const[chave, setChave]= useState('')

  const[atualizando, setAtualizando]= useState(false)
   
  console.log(nome, email, telefone, observacao)

  useEffect(() =>{
    const refContatos = database.ref('contatos')

    refContatos.on('value', resultado =>{
      const resultadoContatos = Object.entries<Contato>(resultado.val() ?? {}).map(([chave, valor]) =>{
        return{
          'chave': chave,
          'nome': valor.nome,
          'email': valor.email,
          'telefone': valor.telefone,
          'observacao': valor.observacao
        }
      })

      setConstatos(resultadoContatos)
    })

  }, []);

  function buscar(event: FormEvent){
    const palavra = event.target.value
    if(palavra.length > 0){
      setEstaBuscando(true)
      const dados = new Array

      constatos?.map(contato =>{
        const regra = new RegExp(event.target.value, "gi")
        if(regra.test(contato.nome)){
          dados.push(contato)
        }
      })

      setBusca(dados)
    }else{
      setEstaBuscando(false)
    }
    
  }

  function gravar(event: FormEvent){

    event.preventDefault()
    
    const ref = database.ref('contatos')
    const dados = {
      nome,
      email,
      telefone,
      observacao
    }

    ref.push(dados)
    setNome('')
    setEmail('')
    setTelefone('')
    setObservacao('')
  };

  function deleta(ref: string){
    const referencia = database.ref(`contatos/${ref}`).remove()
  }

  function editarDados(contato: Contato){
    setAtualizando(true)
    setChave(contato.chave)
    setNome(contato.nome)
    setEmail(contato.email)
    setTelefone(contato.telefone)
    setObservacao(contato.observacao)
  }
  function atualizarContato(){
    const ref = database.ref('contatos')

    const dados ={
      'nome':nome,
      'email':email,
      'telefone':telefone,
      'observacao':observacao
    }
    ref.child(chave).update(dados)

    setNome('')
    setEmail('')
    setTelefone('')
    setObservacao('')

    setAtualizando(false)
  }

  return (
    <>
      <main className={styles.container}>
        <form>
          <input type="text" placeholder="Nome" value={nome} onChange={event => setNome(event.target.value)}></input>
          <input type="email" placeholder="Email" value={email} onChange={event => setEmail(event.target.value)}></input>
          <input type="tel" placeholder="Telefone" value={telefone} onChange={event => setTelefone(event.target.value)}></input>
          <textarea placeholder="Observações" value={observacao} onChange={event => setObservacao(event.target.value)}></textarea>
          {atualizando ?
            <button type="button" onClick={atualizarContato}>Atualizar</button> :
            <button type="button" onClick={gravar}>Salvar</button>
          }
          
        </form>

          <div className={styles.caixadecontatos}>
            <input type="text" placeholder="Buscar" onChange={buscar}/>
                {estaBuscando ? 
                  busca?.map(contato =>{
                    return(
                      <div key={contato.chave} className={styles.caixaIndividual}>
                        <div className={styles.boxTitulo}>
                          <p className={styles.nomeTitulo}>{contato.nome}</p>
                          <div>
                            <a onClick={() => editarDados(contato)}>Editar</a>
                            <a onClick={() => deleta(contato.chave)}>Excluir</a>
                          </div>
                        </div>
                        <div className={styles.dados}>
                          <p>{contato.email}</p>
                          <p>{contato.telefone}</p>
                          <p>{contato.observacao}</p>
                        </div>
                      </div>
                    )
                  })
                 : 
                 constatos?.map(contato =>{
                  return(
                    <div key={contato.chave} className={styles.caixaIndividual}>
                      <div className={styles.boxTitulo}>
                        <p className={styles.nomeTitulo}>{contato.nome}</p>
                        <div>
                          <a onClick={() => editarDados(contato)}>Editar</a>
                          <a onClick={() => deleta(contato.chave)}>Excluir</a>
                        </div>
                      </div>
                      <div className={styles.dados}>
                        <p>{contato.email}</p>
                        <p>{contato.telefone}</p>
                        <p>{contato.observacao}</p>
                      </div>
                    </div>
                  )
                })
                 }
          </div>
          
        
      </main>
    </>
  )
}
